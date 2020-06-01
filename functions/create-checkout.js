/*
 * This function creates a Stripe Checkout session and returns the session ID
 * for use with Stripe.js (specifically the redirectToCheckout method).
 *
 * @see https://stripe.com/docs/payments/checkout/one-time
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 2,
});

/*
 * Product data can be loaded from anywhere. In this case, we’re loading it from
 * a local JSON file, but this could also come from an async call to your
 * inventory management service, a database query, or some other API call.
 *
 * The important thing is that the product info is loaded from somewhere trusted
 * so you know the pricing information is accurate.
 */
const inventory = require('./data/products.json');
const shippingCountries = require('./data/shippingCountries.json');

const paymentMethodsByCurrency = {
  USD: ['card', 'alipay'],
  EUR: ['card', 'alipay', 'bancontact', 'ideal', 'giropay', 'eps', 'p24'],
  GBP: ['card', 'alipay'],
  AUD: ['card', 'alipay'],
  SGD: ['card', 'alipay'],
  JPY: ['card', 'alipay'],
};

exports.handler = async (event) => {
  try {
    const { sku, quantity, seller, currency } = JSON.parse(event.body);
    const product = inventory.find((p) => p.sku === sku);
    const price = product.prices.find((p) => p.currency === currency);
    if (!product || !price) throw new Error(`Can't find product or price!`);

    // ensure that the quantity is within the allowed range
    const validatedQuantity = quantity > 0 && quantity < 11 ? quantity : 1;

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: paymentMethodsByCurrency[price.currency],
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: shippingCountries,
        },

        /*
         * This env var is set by Netlify and inserts the live site URL. If you want
         * to use a different URL, you can hard-code it here or check out the
         * other environment variables Netlify exposes:
         * https://docs.netlify.com/configure-builds/environment-variables/
         */
        success_url: `${process.env.URL}/success`,
        cancel_url: process.env.URL,
        line_items: [
          {
            name: product.name,
            description: product.description,
            images: [product.image],
            amount: price.amount,
            currency: price.currency,
            quantity: validatedQuantity,
          },
        ],
        // We are using the metadata to track which items were purchased.
        // We can access this meatadata in our webhook handler to then handle
        // the fulfillment process.
        // In a real application you would track this in an order object in your database.
        metadata: {
          items: JSON.stringify([
            {
              sku: product.sku,
              name: product.name,
              quantity: validatedQuantity,
            },
          ]),
        },
      },
      {
        stripeAccount: process.env[seller],
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
        stripeAccount: process.env[seller],
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error }),
    };
  }
};
