import React from 'react';

const oAuthURL = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_STRIPE_CLIENT_ID}&scope=read_write`;

const Connect = () => {
  return (
    <a
      className="stripe-connect"
      href={oAuthURL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>Connect with Stripe</span>
    </a>
  );
};

export default Connect;
