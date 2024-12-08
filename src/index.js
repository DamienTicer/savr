import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Log the root element to check if it exists
console.log("Root element:", document.getElementById("root"));

// Find the root element in the DOM
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root container not found. Make sure <div id='root'></div> exists in public/index.html.");
}

// Create the React root and render the app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
