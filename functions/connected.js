const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 2,
});

exports.handler = async ({ queryStringParameters }) => {
  let responseMessage = `Connection failed`;
  const { code } = queryStringParameters;

  if (code) {
    try {
      await stripe.oauth.token({
        grant_type: 'authorization_code',
        code,
      });

      responseMessage = `Successfully connected`;
    } catch (error) {
      responseMessage = `${responseMessage}: ${error.message}`;
    }
  }

  return {
    statusCode: 200,
    body: responseMessage,
  };
};
