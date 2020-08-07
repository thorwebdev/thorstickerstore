const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 2,
});

exports.handler = async ({ queryStringParameters }) => {
  const { account } = queryStringParameters;
  try {
    const accountObject = await stripe.accounts.retrieve(account);
    const { details_submitted } = accountObject;

    if (!details_submitted) {
      // Disconnect unclaimed account
      await stripe.oauth.deauthorize({
        client_id: process.env.REACT_APP_STRIPE_CLIENT_ID,
        stripe_user_id: account,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ details_submitted }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error }),
    };
  }
};
