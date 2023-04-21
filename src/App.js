import React from "react";
import { SocketProvider } from "./components/SocketProvider";
import Start from "./components/Start";
import "./App.css";

function App() {
  return (
    <SocketProvider>
      <Start />
    </SocketProvider>
  );
}

export default App;
