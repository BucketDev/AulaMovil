import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';

exports.helloWorld = functions.https.onCall((data, context) => {
  return `Hello World! ${data.name}`;
});

