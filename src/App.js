import React from 'react';
import logo from './logo.svg';
import './App.css';

import { loadStripe } from '@stripe/stripe-js';

function format(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((amount / 100).toFixed(2));
}

function App() {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = new FormData(event.target);

    const data = {
      sku: form.get('sku'),
      seller: form.get('seller'),
      quantity: Number(form.get('quantity')),
    };
    console.log({ data });
    const { sessionId, stripeAccount } = await fetch(
      '/.netlify/functions/create-checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    ).then((res) => res.json());

    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
      { stripeAccount }
    );
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>MJÖLNIR STICKER: {format(500, 'usd')}</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            defaultValue="1"
            min="1"
            max="10"
          />
          <input type="hidden" name="sku" value="thorwebdev_standard" />
          <input type="hidden" name="seller" value="SOSPLUSH" />
          <button type="submit">Buy Now</button>
        </form>
        <a
          className="App-link"
          href="https://twitter.com/thorwebdev"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©THORWEBDEV
        </a>
      </header>
    </div>
  );
}

export default App;
