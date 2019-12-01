// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.linkUser = functions.auth.user().onCreate(user => {
  console.log('user');
  console.log(user);
  var email = user.email;
  var uid = user.uid;
  console.log('email', email);
  var db = admin.firestore();
  if (email) {
    return db.collection('users').where('email', '==', email)
    .get()
    .then(querySnapshot => {
        console.log(querySnapshot);
        var promises = [];
        querySnapshot.forEach(doc => {
            console.log(doc.id, " => ", doc.data());
            // Build doc ref from doc.id
            var docRef = db.collection('users').doc(doc.id);
            promises.push(docRef.update({
                linkedUID: uid
            }));
        });
        return Promise.all(promises).then(_ => console.log('success'));
    });
  } else {
      return false;
  }
});