import React from "react";

export default function PopUp(props) {
  return (
    <div
      className="overlay"
      style={{ display: props.isOpen ? "flex" : "none" }}
    >
      <div className="popup-box">
        <span className="close-btn" onClick={props.togglePopup}>
          &times;
        </span>
        <p>Signed up successfully.</p>
      </div>
    </div>
  );
}
