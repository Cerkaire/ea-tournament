import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { UserContextProvider } from './context/UserContext';

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <UserContextProvider>
      <App />
    </UserContextProvider>
  </BrowserRouter>
);
