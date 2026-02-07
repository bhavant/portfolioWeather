/**
 * Application Entry Point
 *
 * Mounts the React app to the #root DOM element.
 * Imports global Tailwind CSS styles.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Mount React to the #root element defined in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
