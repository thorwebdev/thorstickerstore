const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 2,
});

exports.handler = async (event) => {
  try {
    const account = await stripe.accounts.create({
      type: 'standard',
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.URL}/connect?account=${account.id}`,
      return_url: `${process.env.URL}/connect?account=${account.id}`,
      type: 'account_onboarding',
    });

    return {
      statusCode: 200,
      body: JSON.stringify(accountLink),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error }),
    };
  }
};
