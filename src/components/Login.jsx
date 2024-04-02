import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../context/Firebase";
export default function Login(props) {
  const firebase = useFirebase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="center">
      <h1>{props.heading}</h1>
      <form action="" className="container">
        <input
          type="text"
          name="email"
          placeholder="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button
          className="clicks"
          type="Submit"
          onClick={(e) => {
            e.preventDefault();
            firebase.loginUser(email, password);
          }}
        >
          {props.buttonText}
        </button>

        <button
          className="clicks google-signup"
          onClick={(e) => {
            e.preventDefault();
            firebase.googleSignIn();
          }}
        >
          {props.googleSignIn}
        </button>

        <Link className="clicks" to={props.anchorLink}>
          {props.anchorText}
        </Link>

        <Link className="clicks" to={props.anchorLink}>
          {props.forgotPassword}
        </Link>
      </form>
      <p>{firebase.error}</p>
    </div>
  );
}
