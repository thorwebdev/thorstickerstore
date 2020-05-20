import React, { useReducer } from 'react';
import logo from './logo.svg';
import './App.css';

import { loadStripe } from '@stripe/stripe-js';

const formatPrice = ({ amount, currency, quantity }) => {
  const isClient = typeof window !== 'undefined';
  const numberFormat = new Intl.NumberFormat(
    isClient ? window.navigator.language : 'en-US',
    {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }
  );
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100;
  const total = (quantity * amount).toFixed(2);
  return numberFormat.format(total);
};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {
        ...state,
        quantity: state.quantity + 1,
        price: formatPrice({
          amount: state.unitAmount,
          currency: state.currency,
          quantity: state.quantity + 1,
        }),
      };
    case 'decrement':
      return {
        ...state,
        quantity: state.quantity - 1,
        price: formatPrice({
          amount: state.unitAmount,
          currency: state.currency,
          quantity: state.quantity - 1,
        }),
      };
    case 'setLoading':
      return { ...state, loading: action.payload.loading };
    case 'setError':
      return { ...state, error: action.payload.error };
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, {
    unitAmount: 400,
    currency: 'USD',
    quantity: 1,
    price: formatPrice({
      amount: 400,
      currency: 'USD',
      quantity: 1,
    }),
    loading: false,
    error: null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch({ type: 'setLoading', payload: { loading: true } });

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
      alert(error.message);
      dispatch({ type: 'setLoading', payload: { loading: false } });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          MJÖLNIR STICKER{state.quantity !== 1 ? 'S' : ''}: {state.price}
        </p>
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="sku" value="thorwebdev_standard" />
          <input type="hidden" name="seller" value="SOSPLUSH" />
          <div className="quantity-setter">
            <button
              type="button"
              className="increment-btn"
              disabled={state.quantity === 1}
              onClick={() => dispatch({ type: 'decrement' })}
            >
              -
            </button>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max="10"
              value={state.quantity}
              readOnly
            />
            <button
              type="button"
              className="increment-btn"
              disabled={state.quantity === 10}
              onClick={() => dispatch({ type: 'increment' })}
            >
              +
            </button>
          </div>
          <button role="link" type="submit" disabled={state.loading}>
            {state.loading || !state.price
              ? `Loading...`
              : `Buy for ${state.price}`}
          </button>
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
