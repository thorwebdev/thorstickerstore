import React, { useReducer } from 'react';
import logo from './logo.svg';
import './App.css';

import { loadStripe } from '@stripe/stripe-js';

const formatPrice = ({ amount, currency, quantity, noSymbol }) => {
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
  const total = zeroDecimalCurrency ? (quantity * amount) : (quantity * amount).toFixed(2);
  return noSymbol ? total.toString() : numberFormat.format(total);
};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      document.querySelector('.App-logo').style.animationDuration = `${
        state.animationDuration / 2
        }s`;
      return {
        ...state,
        quantity: state.quantity + 1,
        price: formatPrice({
          amount: state.prices[state.currency.selected],
          currency: state.currency.selected,
          quantity: state.quantity + 1,
        }),
        animationDuration: state.animationDuration / 2,
      };
    case 'decrement':
      document.querySelector('.App-logo').style.animationDuration = `${
        state.animationDuration * 2
        }s`;
      return {
        ...state,
        quantity: state.quantity - 1,
        price: formatPrice({
          amount: state.prices[state.currency.selected],
          currency: state.currency.selected,
          quantity: state.quantity - 1,
        }),
        animationDuration: state.animationDuration * 2,
      };
    case 'setCurrency':
      return {
        ...state,
        currency: { ...state.currency, selected: action.payload.currency },
        price: formatPrice({
          amount: state.prices[action.payload.currency],
          currency: action.payload.currency,
          quantity: state.quantity,
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
    quantity: 1,
    currency: {
      options: ['USD', 'EUR', 'GBP', 'SGD', 'JPY'],
      selected: 'USD'
    },
    prices: {
      USD: 400,
      EUR: 360,
      GBP: 320,
      SGD: 550,
      JPY: 430,
    },
    price: formatPrice({
      amount: 400,
      currency: 'USD',
      quantity: 1,
    }),
    loading: false,
    error: null,
    animationDuration: 10
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
          MJÖLNIR STICKER{state.quantity !== 1 ? 'S' : ''}: {formatPrice({
          amount: state.prices[state.currency.selected],
          currency: state.currency.selected,
          quantity: state.quantity,
          noSymbol: true,
        })}
          <select onChange={e => dispatch({ type: 'setCurrency', payload: { currency: e.target.value } })}>{
            state.currency.options.map(c => (
              <option key={c} value={c}>{c}</option>
            ))
          }</select>
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
        <a className="Terms-link" href="/terms">
          Terms · Privacy Policy · Refunds · About
        </a>
      </header>
    </div>
  );
}

export default App;
