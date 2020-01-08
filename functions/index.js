// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.linkUser = functions.region('europe-west2').auth.user().onCreate(user => {
  console.log('user');
  console.log(user);
  var email = user.email;
  var uid = user.uid;
  var photoURL = user.photoURL;
  console.log('email', email);
  if (email) {
    return db.collection('users').where('email', '==', email)
    .get()
    .then(querySnapshot => {
        console.log(querySnapshot);
        var promises = [];
        querySnapshot.forEach(doc => {
            console.log(doc.id, ' => ', doc.data());
            // Build doc ref from doc.id
            var docRef = db.collection('users').doc(doc.id);
            promises.push(docRef.update({
                linkedUID: uid,
                photoURL: photoURL
            }));
        });
        return Promise.all(promises).then(_ => console.log('success'));
    });
  } else {
      return false;
  }
});

// When a firestore user document has its roles updated, also update the custom claims on the firebase user
// NB: if a user document changes its email field, this will update the user matching the email before it was edited
exports.updateRoles = functions.region('europe-west2').firestore.document('users/{userId}').onWrite((change, context) => {
    // check we have a user with an email and that the roles have been updated
    const email = change.before.get('email');
    const rolesBefore = change.before.get('roles');
    const roles = change.after.exists ? change.after.get('roles') : [];
    const rolesMatch = roles === rolesBefore;
    if (!email || rolesMatch) {
        console.log('either no email or roles match, nothing to do');
        console.log('email', email);
        console.log('rolesMatch', rolesMatch, rolesBefore, roles);
        return;
    }
    // find the user and then update the claims to match the roles
    return admin.auth().getUserByEmail(email)
    .then(user => {
        // convert the claims from an array to key/value pairs
        var customClaims = {};
        roles.forEach(role => {
            customClaims[role] = true;
        });
        // to remove all claims, customClaims has to be null
        if (roles.length === 0) { customClaims = null; }
        // now set the custom claims on this user
        return admin.auth().setCustomUserClaims(user.uid, customClaims)
        .then(() => {
            console.log('successful update to customClaims');
            console.log(email, user.uid, customClaims);
            // update firestore to notify client to force refresh
            // set the refresh time to the current UTC timestamp
            // this will be captured on the client to force a token refresh
            return db.doc('metadata/' + user.uid).set({
                refreshTime: new Date(),
                customClaims: customClaims
            });
        });
    })
    .catch(error => {
        console.log(error);
    });
});
