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

exports.createSubscription = functions.https.onCall((data, context) => {
  if (context.auth && context.auth.uid) {
    return admin.firestore().doc(`users/${context.auth.uid}`).get()
      .then((snapshot) => {
        // @ts-ignore
        const {customerId, defaultPaymentId} = snapshot.data();
        const plan = data.plan;
        return stripe.subscriptions.create({
          customer: customerId,
          default_payment_method: defaultPaymentId,
          items: [{
            plan: plan.id
          }]
        })
          .then((subscriptionList: any) => {
            const subscriptions = subscriptionList.data;
            return subscriptions.map((subscription: any) => {
              subscription.productId = subscription.plan.product;
              return subscription;
            });
          })
          .catch(console.error);
      })
      .catch(console.error);
  }
  return null;
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

exports.attachPaymentToCustomer = functions.https.onCall(async (data, context) => {
  if (context.auth && context.auth.uid) {
    const uid = context.auth.uid;
    return admin.firestore().doc(`users/${uid}`).get()
      .then((snapshot) => {
        // @ts-ignore
        const {customerId} = snapshot.data();
        return stripe.paymentMethods.attach(data.payment.id, { customer: customerId })
          .then(() => {return true})
          .catch((error: any) => {console.error(error); return false});
      })
      .catch((error: any) => {console.error(error); return false});
  }
  return false;
});

exports.findStripeProducts = functions.https.onCall(async (data, context) => {
  const productsList = await stripe.products.list();
  const products = productsList.data;
  const plansList = await stripe.plans.list();
  const plans = plansList.data;
  return products.map((product: any) => {
    product.plans = plans.filter((retrievedPlan: any) => retrievedPlan.product === product.id);
    product.metadata = Object.keys(product.metadata).map((key, index) => {
      return {key, value: Object.values(product.metadata)[index]}
    });
    return product;
  });
});

exports.findPaymentMethods = functions.https.onCall((data, context) => {
  if (context.auth && context.auth.uid) {
    return admin.firestore().doc(`users/${context.auth.uid}`).get()
      .then((snapshot) => {
        // @ts-ignore
        const {customerId} = snapshot.data();
        return stripe.paymentMethods.list({
          customer: customerId,
          type: 'card'
        })
          .then((paymentList: any) => {
            return paymentList.data;
          })
          .catch(console.error);
      })
      .catch(console.error);
  }
  return null;
});

exports.findSubscriptions = functions.https.onCall((data, context) => {
  if (context.auth && context.auth.uid) {
    return admin.firestore().doc(`users/${context.auth.uid}`).get()
      .then((snapshot) => {
        // @ts-ignore
        const {customerId} = snapshot.data();
        return stripe.subscriptions.list({
          customer: customerId
        })
          .then((subscriptionList: any) => {
            const subscriptions = subscriptionList.data;
            return subscriptions.map((subscription: any) => {
              subscription.productId = subscription.plan.product;
              return subscription;
            });
          })
          .catch(console.error);
      })
      .catch(console.error);
  }
  return null;
});

exports.cancelSubscription = functions.https.onCall((data, context) => {
  if (context.auth && context.auth.uid) {
    const subscription: string = data.subscription.id;
    return stripe.subscriptions.del(subscription)
      .catch(console.error);
  }
  return null;
});

exports.cancelSubscriptionAtPeriodEnd = functions.https.onCall((data, context) => {
  if (context.auth && context.auth.uid) {
    const subscription: string = data.subscription.id;
    return stripe.subscriptions.update(subscription, { cancel_at_period_end: true })
      .catch(console.error);
  }
  return null;
});
