import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../context/Firebase";
export default function SignUp(props) {
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
            firebase.signupUser(email, password);
          }}
        >
          {props.buttonText}
        </button>
        <button
          className="clicks google-signup"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            firebase.googleSignUp();
          }}
        >
          {props.signUpWithGoogle}
        </button>
        <Link className="clicks" to={props.anchorLink}>
          {props.anchorText}
        </Link>
      </form>
    </div>
  );
}
