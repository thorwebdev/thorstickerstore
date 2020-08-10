import React, { useState, useEffect } from 'react';

const createAccount = async () => {
  document.querySelector('button').disabled = true;

  const { url } = await fetch(
    '/.netlify/functions/create-account-link'
  ).then((res) => res.json());
  if (url) window.location.assign(url);
};

const Connect = () => {
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    const getAccount = async () => {
      const query = new URLSearchParams(window.location.search);
      const account = query.get('account');
      if (account) {
        const { details_submitted } = await fetch(
          `/.netlify/functions/get-account?account=${account}`
        ).then((res) => res.json());
        details_submitted ? setSubmitted(true) : setSubmitted(false);
      } else {
        setSubmitted(false);
      }
    };
    getAccount();
  }, []);

  if (submitted) {
    return (
      <>
        <h3>You're successfully connected!</h3>
        <a className="stripe-connect" href="https://dashboard.stripe.com/">
          <span>Go to Dashboard</span>
        </a>
      </>
    );
  } else if (submitted !== null) {
    return (
      <button className="stripe-connect" onClick={createAccount} type="link">
        <span>Connect with Stripe</span>
      </button>
    );
  }
  return 'Loading...';
};

export default Connect;
