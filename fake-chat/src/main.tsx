import {hydrateRoot} from "https://esm.sh/react-dom/client";
import React from 'https://esm.sh/react';
import App from "./app.tsx";

const root = document.querySelector('#root');
hydrateRoot(root, <App />)