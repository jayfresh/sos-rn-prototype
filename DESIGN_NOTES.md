# Design notes

## The use of Stripe Connect to manage BOSS accounts and take payments

### Registering BOSSES

This overview - https://stripe.com/docs/recipes/store-builder - demonstrates providing an OAuth-powered journey for a BOSS to use
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
  * then a firebase function could respond to this and make the appropriate checkout session call (getting the connected account ID from the BOSS's user record)
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

### Storing customers and cloning saved payment details

This [page on the Stripe website](https://stripe.com/docs/connect/cloning-saved-payment-methods) explains how to create customers on the central platform account
and clone a payment method for use with a connected account. This suggests a flow where the customer signs up centrally and adds their payment method, then we clone
that on to the connected account before they make a purchase. This will presumably also make it easier to purchase services from the central account.

This [page](https://stripe.com/docs/payments/checkout/collecting) explains how to create a Checkout Session that will collect payment details, not make a payment,
which could be useful for providing a Stripe-hosted interface for setting a customer up with payment details. This page also shows how to use a Customer object
you've previously saved (I assume using the method in the previous paragraph).

We can save payment details during checkout - explanation [here](https://stripe.com/docs/payments/checkout/one-time#setup-future-usage). There is also a
[guide to creating more payments](https://stripe.com/docs/payments/save-after-payment#web-create-payment-intent-off-session) with these details, avoiding
another Stripe Checkout Session, and an explanation of what to do if the subsequent payments fail and need the customer to re-authorise, for example.

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

The implementation of handling roles is not great - the React Navigation tab navigator always shows at least one tab, but the tabs are role-dependent, so that's a start.

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

## Custom fonts

The website uses:

* Heebo, 700 (titles, uppercase)
* Heebo, 400 (body copy)
* Heebo, 500 (body STRONG tags)

Font instructions are:

* Archivo Black for titles and buttons - I have ArchivoBlack-Regular.ttf.
* Monserrat for body copy - I have Monserrat-Regular.ttf

Instructions for custom font use are here: https://docs.expo.io/versions/latest/guides/using-custom-fonts/

## App builds and pre-release testing

Expo has a build service, that will build APKs and IPAs for you. More detail here: https://docs.expo.io/versions/latest/distribution/building-standalone-apps/.
Note, when building for Android, use `expo build:android -t apk` to build an APK not an Android App Bundle. After the first build, run `expo fetch:android:keystore`
and store the resulting keystore securely.

Firebase has their App Distribution service, which takes in APKs and IPAs and distributes to Android and iOS testers without using app stores. More info here:
https://firebase.google.com/docs/app-distribution

Notes on app.json customisation:
- `android.permissions` has been set to `[]` to avoid asking for more permissions than are needed
- for standalone apps, some extra config is required for the Facebook login to work, see here: https://docs.expo.io/versions/v36.0.0/sdk/facebook/
- have added "sos" as a linking scheme, but at time of writing this doesn't seem to be necessary for either the Checkout WebView or the Facebook login
- for each build, you have to increment `android.versionCode` and `ios.buildNumber`
- `ios.googleServicesFile` and `android.googleServicesFile` are required for use with Firebase
  - NB: the Expo docs say that including `android.googleServicesFile` automatically switches on Firebase Cloud Messaging - but we're not requesting that in the permissions,
    so we'll have to see whether that forces a request of those permissions...

App store notes:
- Google Play costs $25 to register, which is a one-off fee
  - Expo can build for Android without requiring a Google Play account
- Apple App Store costs $99 per year
- there is a recommendation (here)[https://docs.expo.io/versions/latest/distribution/app-signing/], to opt into Google Play App Signing,
so that the expo-generated signing key is treated as an "upload key" by Google, and Google Play has a separate "app signing key". This allows the use of
Android App Bundles for builds, and provides some security and benefits and the ability to reset an upload key if you lose it. However, Firebase App
Distribution currently says that APKs have to be signed with a debug key or app signing key, so we're avoiding Google Play App Signing for now.

Misc note: Bitrise integrates with Firebase App Distribution, which might be relevant if we used that to do builds.

## Offline behaviour

Expo includes some configuration for offline behaviour. See https://docs.expo.io/versions/latest/guides/offline-support/.

These have been set:
- `updates.fallbackToCacheTimeout` is set to `0` in app.json, which causes updated JS to be downloaded in the background and stored for future use (this behaviour is
very clear when using the Expo client, as after publishing you have to load the app a second time to see the updates)
- assets are cached during app load, using `Font.loadAsync` and `Asset.loadAsync`
- assets are bundled into the built binary using `"assetBundlePatterns": ["assets/*/*"]` in app.json
  - depending on the app binary size, we could leave the images out and cache them on load
  - fonts are needed from the start to avoid FOUC