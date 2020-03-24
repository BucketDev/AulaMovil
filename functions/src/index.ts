import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

admin.initializeApp();

const stripe = require('stripe')(functions.config().stripe.testkey);

exports.createUser = functions.auth.user().onCreate((userRecord, context) => {
  return admin.firestore().doc(`/users/${userRecord.uid}`).set({
    email: userRecord.email
  }).then((result) => {
    return stripe.customers.create({ email: userRecord.email })
      .then((customer: any) => {
        return admin.firestore().doc(`/users/${userRecord.uid}`).update({
          customerId: customer.id
        }).catch(console.error)
      }).catch(console.error);
  }).catch(console.error);
});

exports.addPaymentToCustomer = functions.firestore.document('users/{userUid}/payments/{paymentUid}')
  .onCreate((snapshot, context) => {
    const userRef = snapshot.ref.parent.parent;
    return userRef?.get()
      .then((document: DocumentSnapshot) => {
        // @ts-ignore
        const {customerId} = document.data();
        return stripe.paymentMethods.attach(context.params.paymentUid, { customer: customerId })
          .catch(console.error);
      }).catch(console.error);
  });

exports.createSubscription = functions.firestore.document('users/{userUid}/subscriptions/{subscriptionId}')
  .onCreate((snapshot, context) => {
    const userRef = snapshot.ref.parent.parent;
    return userRef?.get()
      .then((document: DocumentSnapshot) => {
        // @ts-ignore
        const {customerId, defaultPaymentId} = document.data();
        return stripe.subscriptions.create({
          customer: customerId,
          default_payment_method: defaultPaymentId,
          items: [{
            plan: 'plan_GqqM8MgAxur82p'
          }]
        }).then((subscription: any) => {
          console.log(subscription);
          return userRef?.collection('subscriptions').doc(context.params.subscriptionId).update({
            status: subscription.status,
            startDate: subscription.start_date,
            trialStart: subscription.trial_start,
            trialEnd: subscription.trial_end,
            daysUntilDue: subscription.days_until_due,
            created: subscription.created,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            collectionMethod: subscription.collection_method,
            billingCycleAnchor: subscription.billing_cycle_anchor,
            cancelAt: subscription.cancel_at,
            canceledAt: null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            latestInvoice: subscription.latest_invoice
          }).catch(console.error)
        }).catch(console.error);
      }).catch(console.error)
  });

exports.recurringPayment = functions.https.onRequest((req, resp) => {
  const data = req.body.data.object;
  if (!data) throw new Error('missing data');
  return admin.firestore().collection('users')
    .where('customerId', '==', data.customer).limit(1).get()
    .then((snapshot) => {
      const user = snapshot.docs.pop();
      if (user) {
        user.ref.collection("subscriptions")
          .where("status", "in", ["active", "past_due"]).limit(1).get()
          .then(async (subsSnapshot) => {
            const subscription = subsSnapshot.docs.pop();
            if (subscription) {
              const hook = req.body.type;
              if (hook === 'invoice.payment_succeeded') {
                await subscription.ref.update({status: 'active'})
              } else
              if (hook === 'invoice.payment_failed') {
                await subscription.ref.update({status: 'past_due'})
              }
              resp.status(200).send();
            } else {
              resp.status(404).send('Subscription not found');
            }
          }).catch(console.error)
      } else {
        resp.status(404).send('User not found');
      }
    })
    .catch(console.error);
});

exports.copyDataFromUserToUser = functions.https.onRequest((req, resp) => {
  const {from, to} = req.body;
  if (from !== undefined && to !== undefined) {
    console.log(`Copying from user: ${from} to user: ${to}`);
    const fromRef = admin.firestore().doc(`users/${from}`).collection('groups');
    const toRef = admin.firestore().doc(`users/${to}`).collection('groups');
    fromRef.get().then(snapshot => {
      console.log(`Copying ${snapshot.docs.length} groups`);
      snapshot.docs.forEach(group => {
        toRef.doc(group.id).set(group.data()).then(() => {
          fromRef.doc(group.id).collection('students').get().then(snapshotStudents => {
            snapshotStudents.docs.forEach(async student => {
              await toRef.doc(group.id).collection('students').doc(student.id).set(student.data());
            });
          }).catch(console.error);
          fromRef.doc(group.id).collection('activities').get().then(snapshotActivities => {
            snapshotActivities.docs.forEach(async activity => {
              await toRef.doc(group.id).collection('activities').doc(activity.id).set(activity.data());
            });
          }).catch(console.error);
          fromRef.doc(group.id).collection('assistance').get().then(snapshotAssistance => {
            console.log(`Copying ${snapshotAssistance.docs.length} assistance from group ${group.id}`);
            snapshotAssistance.docs.forEach(async assistance => {
              await toRef.doc(group.id).collection('assistance').doc(assistance.id).set(assistance.data());
            });
          }).catch(console.error);
        }).catch(console.error);
      })
    }).catch(console.error);
  } else {
    resp.status(500).send('There are no users from or to copy values');
  }
  resp.status(200).send();
});

exports.updateStudentsTotal = functions.firestore.document('users/{userUid}/groups/{groupUid}/students/{studentUid}')
  .onWrite((snapshot, context) => {
    const studentRef = snapshot.after.ref;
    const studentCollection = studentRef.parent;
    if (studentRef.parent.parent) {
      const groupRef = studentRef.parent.parent;
      if (groupRef !== undefined) {
        return studentCollection.listDocuments().then((documents) =>
          groupRef.update({students: documents.length})
        ).catch(console.error);
      }
    }
    return null;
  });

exports.updateActivitiesTotal = functions.firestore.document('users/{userUid}/groups/{groupUid}/activities/{activityUid}')
  .onWrite((snapshot, context) => {
    const activityRef = snapshot.after.ref;
    const activitiesCollection = activityRef.parent;
    if (activityRef.parent.parent) {
      const groupRef = activityRef.parent.parent;
      if (groupRef !== undefined) {
        return activitiesCollection.listDocuments().then((documents) =>
          groupRef.update({activities: documents.length})
        ).catch(console.error);
      }
    }
    return null;
  });

exports.updateActivityStatus = functions.firestore.document('users/{userUid}/groups/{groupUid}/activities/{activityUid}')
  .onUpdate((change, context) => {
    // @ts-ignore
    const {grades} = change.after.data();
    const activityRef = change.after.ref;
    const groupRef = activityRef.parent.parent;
    return groupRef?.get()
      .then((groupSnapshot: DocumentSnapshot) => {
        // @ts-ignore
        const {students} = groupSnapshot.data();
        let status = 0;
        if (students > 0) {
          if (students === grades.length) {
            status = 2;
          } else if (grades.length > 0) {
            status = 1;
          }
          return activityRef.update({status}).catch(console.error);
        }
        return null;
      }).catch(console.error);
  });

exports.helloWorld = functions.https.onCall((data, context) => {
  return `Hello World! ${data.name}`;
});

