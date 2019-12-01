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
