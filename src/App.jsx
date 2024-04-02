import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ToDoLists from "./components/ToDoLists";
import { useFirebase } from "./context/Firebase";

export default function App() {
  const firebase = useFirebase();
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const checkAuthState = firebase.loggedInUser();
    setLoggedInUser(checkAuthState);
    setLoading(false);
  }, [firebase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            loggedInUser ? (
              <Navigate to="/todo-lists" />
            ) : (
              <SignUp
                heading="Sign-Up to get started."
                buttonText="Sign-Up"
                anchorText="Login"
                anchorLink="/login"
                signUpWithGoogle="Sign-Up with Google"
              />
            )
          }
        />
        <Route
          path="/login"
          element={
            loggedInUser ? (
              <Navigate to="/todo-lists" />
            ) : (
              <Login
                heading="Login to manage your tasks."
                buttonText="Login"
                anchorText="Sign-Up"
                anchorLink="/"
                forgotPassword="Forgot Password?"
                googleSignIn="Sign In With Google"
              />
            )
          }
        />
        <Route
          path="/todo-lists"
          element={loggedInUser ? <ToDoLists /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}
