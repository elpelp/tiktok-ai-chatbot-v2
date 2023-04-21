import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import "./css/StylesComponent.css";

function StylesComponent() {
  const socket = useContext(SocketContext);
  const [selectedStyle, setSelectedStyle] = useState(localStorage.getItem("selectedStyle") || "Normal");

  useEffect(() => {
    if (socket) {
      socket.emit("SetStyle", selectedStyle);
      localStorage.setItem("selectedStyle", selectedStyle);
    }
  }, [selectedStyle, socket]);

  function handleChange(event) {
    const newStyle = event.target.value;
    setSelectedStyle(newStyle);
  }

  return (
    <>
      <div className="settings-item">
        <label htmlFor="styles">Style: </label>
        <select id="dropdown" value={selectedStyle} onChange={handleChange}>
          <option value="Normal">Normal</option>
          <option value="Funny">Funny</option>
          <option value="Annoying">Annoying</option>
          <option value="Sarcastic">Sarcastic</option>
        </select>
      </div>
    </>
  );
}

export default StylesComponent;
