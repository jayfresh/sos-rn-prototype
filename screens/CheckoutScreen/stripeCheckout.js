import getEnvVars from '../../environment';
const { stripeConfig } = getEnvVars();

/**
 * Create the Stripe Checkout redirect html code for a given user
 * @param {String} userID
 * @returns {String}
 */
export function stripeCheckoutRedirectHTML(userID) {
  if (!userID) {
    throw new Error('Invalid userID');
  }

  return `
  <html>
    <body>

      <!-- Load Stripe.js on your website. -->
      <script src="https://js.stripe.com/v3"></script>

      <h1>Loading&hellip;</h1>
      <div id="error-message"></div>

      <script>
        (function () {
          var stripe = Stripe('${stripeConfig.stripe_publishable_key}');

          window.onload = function () {
            // When the customer clicks on the button, redirect
            // them to Checkout.
            stripe.redirectToCheckout({
              items: [{ sku: '${stripeConfig.sku}', quantity: 1 }],

              // Do not rely on the redirect to the successUrl for fulfilling
              // purchases, customers may not always reach the success_url after
              // a successful payment.
              // Instead use one of the strategies described in
              // https://stripe.com/docs/payments/checkout/fulfillment
              successUrl: '${stripeConfig.success_url}',
              cancelUrl: '${stripeConfig.cancel_url}',

              clientReferenceId: '${userID}',
            })
            .then(function(result) {
                if (result.error) {
                    // If redirectToCheckout fails due to a browser or network
                    // error, display the localized error message to your customer.
                    var displayError = document.getElementById('error-message');
                    displayError.textContent = result.error.message;
                }
            })
            .catch(function(ex) {
                var displayError = document.getElementById('error-message');
                displayError.textContent = result.error.message;
            });
          };
        })();
      </script>

    </body>
  </html>
  `;
}
