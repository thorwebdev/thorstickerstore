import React from 'react';
import logo from '../logo.svg';
import '../App.css';

const Success = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          THANKS FOR YOUR PURCHASE!{' '}
          <span role="img" aria-label="heart emoji">
            💖
          </span>
        </p>
        <p>
          We're now printing your stickers and they will ship from the US within
          1-3 days! <br /> Shipping time will vary depending on your location!{' '}
          <br /> You will receive an email receipt separately.
        </p>
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
};

export default Success;
