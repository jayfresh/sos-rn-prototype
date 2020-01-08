## The use of Stripe Connect to manage teacher accounts and take payments

### Registering teachers

This overview - https://stripe.com/docs/recipes/store-builder - demonstrates providing an OAuth-powered journey for a teacher to use
to register their own Stripe account, and shows how you can specify their account when you initiate payments.

The guide references these pieces of data that come back at the end of the OAuth journey:

```
{
  ...
  "stripe_publishable_key": "pk_live_h9xguYGf2GcfytemKs5tHrtg", // <-- this is used request tokens from a client
  "access_token": "sk_live_AxSI9q6ieYWjGIeRbURf6EG0", // <-- not sure what this is for
  "stripe_user_id": "acct_kPeFOh4yFbpCNP", // <-- this is what you need to provide when making charges for the connected account
  ...
}
```

Here's an example of making a charge using a connected account:

```
curl https://api.stripe.com/v1/charges \
  -u <STRIPE_SECRET_KEY>: \
  -H "Stripe-Account: acct_kPeFOh4yFbpCNP" \
  -d amount=1000 \
  -d currency=usd \
  -d source="{TOKEN}"
```

### Handling the customer-facing checkout flow

There are several factors that constrain the methods we can use to implement a customer-facing checkout flow:

* needs to work with a managed Expo app
* needs to provide compliance with the Secure Customer Authentication regulation - https://stripe.com/gb/guides/sca-payment-flows
* needs to allow for specifying a connected account

Options include:

* collecting card details in a form, and then tokenizing the card using the Stripe APIs - see `submitNewCreditCard`
in the firestripe sample app - https://github.com/firebase/functions-samples/blob/master/stripe/public/index.html
  * this approach choreographs the client creating entries in firestore, firebase functions responding to those to make
  calls to Stripe, the server subsequently creating further entries in firestore, and these then having an effect on the client
* using a webview to host the Stripe checkout pages - see this article: https://medium.com/front-end-weekly/how-to-use-stripe-checkout-javascript-sdk-in-react-native-expo-app-without-ejecting-2020-sca-bb88cbde2ac2
  * note that a server-side call is required to setup a Checkout session for a Connected Account - https://stripe.com/docs/payments/checkout/connect
  * as noted here, the client-side only integration (as shown in the above article) is not compatiable with Connect - https://stripe.com/docs/payments/checkout/client
* we could create a booking object in firestore when the customer clicks to book a class
  * then a firebase function could respond to this and make the appropriate checkout session call (getting the connected account ID from the teacher's user record)
  * that session ID would be saved back on the booking, which the client would then see
  * the client could then redirect to the Checkout page
  * when the checkout is completed, a Stripe webhook can hit a firebase function, that can update the booking and (potentially) the client can pick up on this
  to terminate the checkout page...
    * this is an example of using the `WebBrowser` module to open up a modal web browser and then detect when that is redirected back to the app - https://github.com/expo/examples/blob/master/with-webbrowser-redirect/app/App.js
    * an issue is that the Stripe SDK is not available for Expo apps, so I think I'll have to go with the WebView method shown in the Medium article linked above
* 20/12/19: verified that using the WebView technique works for loading the checkout, completing the purchase and detecting the success URL. Parameterised the checkout flow to use the booking ID
  * the next steps: create a session redirect for the connected account (server-side); update booking to use logged-in user ID

### Test card details

See this page, at the bottom: https://stripe.com/docs/payments/save-and-reuse

## Handling roles

### Handling roles within the interface

What we need is a system to allow people to see different menu items depending on what role they are. This could be achieved via responding to roles within the JSX.
Auth0 have a good tutorial about role-based access control (https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/#Role-Based-Access-Control--a-Better-Solution),
which shows the use of a file of rules for each role, and then a `Can` component that you use like this:

```
<Can
  role={user.role}
  perform="dashboard-page:visit"
  yes={() => (
    <h2>User can do it</h2>
  )}
  no={() => <h2>User can't do it</h2>}
/>
```

### Granting roles to users

Ideas for giving certain users roles:

* run a script on user authentication that adds roles to the user object if the email address matches a list e.g. for admins
* add a custom claim to the ID token returned by the authentication server e.g. `context.idToken['https://my-app/role'] = user.app_metadata.role`
* use Firebase auth custom claims to store role information on the user's token - these are available in the client and within Firestore security rules
  * video introducing the concepts here: https://www.youtube.com/watch?v=3hj_r_N0qMs
    * also has a link to a related codelab: https://codelabs.developers.google.com/codelabs/firebase-admin/#0
  * docs here: https://firebase.google.com/docs/auth/admin/custom-claims
  * we'd need to run a Cloud Function to grant appropriate roles to users - one option is to run such a function when a document in the user collection
  is updated, and check whether that document has just had a role added (or removed), and run the custom claim update script if so
  * note, if a custom claim changes whilst the user's token is valid, it will need to be force-refreshed in order to get a new token with the updated claims
    * log out and log back in again, or call `currentUser.getIdToken(true);`

Some useful notes for using the firebase command-line and custom claims:

* firebase login
* firebase use --add (from within the project folder)
* firebase deploy --only firestore (to deploy firestore rules and indexes)
* the user needs to be in Firebase before you can give it a custom claim

Initialising the firebase admin lib:
```
import * as admin from 'firebase-admin';

const serviceAccount = require('serviceAccountKey.json');
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
});
```

Adding a custom claim:
```
const email = 'test@example.com';
const user = yield admin.auth().getUserByEmail(email);
if (user.customClaims && user.customClaims.admin === true) {
    return;
}
return admin.auth().setCustomUserClaims(user.uid, {
    moderator: true,
});
```