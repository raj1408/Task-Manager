import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
  addDoc,
  collection,
  query,
  onSnapshot,
  writeBatch,
  doc,
  serverTimestamp,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByW9OLGFRuWEjeuknt6PnUOJ0lG6-LUFI",
  authDomain: "todo-lists-manager.firebaseapp.com",
  projectId: "todo-lists-manager",
  storageBucket: "todo-lists-manager.appspot.com",
  messagingSenderId: "939607649537",
  appId: "1:939607649537:web:32d80716554e74d391ff00",
  measurementId: "G-NQWN4TSDPY",
  databaseURL: "https://todo-lists-manager-default-rtdb.firebaseio.com/",
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const fireStore = getFirestore(firebaseApp);

const FirebaseContext = createContext(null);

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const FirebaseProvider = (props) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signupUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      setUser(userCredential.user);
      createUserInFirestore(userCredential.user);
    } catch (error) {
      setError(error.message);
      console.log("Signup Error:", error.message);
    }
  };

  const googleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      setUser(result.user);
      createUserInFirestore(result.user);
    } catch (error) {
      setError(error.message);
      console.log("Google Login Error:", error.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      setUser(result.user);
    } catch (error) {
      setError(error.message);
      console.log("Google Login Error:", error.message);
    }
  };

  const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      setUser(userCredential.user);
    } catch (error) {
      setError(error.message);
      console.log("Login Error:", error.message);
    }
  };

  const loggedInUser = () => {
    return user;
  };

  const logOutUser = () => {
    signOut(firebaseAuth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        setError(error.message);
        console.log("Logout Error:", error.message);
      });
  };

  const createUserInFirestore = (authUser) => {
    if (authUser && authUser.email && authUser.uid) {
      const userRef = collection(fireStore, "users");
      addDoc(userRef, {
        email: authUser.email,
        uid: authUser.uid,
        createdAt: serverTimestamp(),
      })
        .then(() => console.log("User created in Firestore"))
        .catch((error) =>
          console.log("Error creating user in Firestore:", error.message)
        );
    }
  };

  const createToDosInFirestore = async (authUser, todoTitle) => {
    if (!authUser || todoTitle === undefined) {
      return;
    }

    try {
      const userTodosRef = collection(fireStore, `todos`);
      const batch = writeBatch(fireStore);

      const newDocRef = doc(userTodosRef);
      const titleValue =
        typeof todoTitle === "string" ? todoTitle : "Default Title";
      batch.set(newDocRef, {
        userID: authUser,
        title: titleValue,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      console.log("ToDos created in Firestore");
    } catch (error) {
      console.log("Error creating ToDos in Firestore:", error.message);
    }
  };

  const getToDoLists = async (authUser) => {
    if (!authUser) {
      console.log("No user to get ToDo lists for");
      return;
    }
    try {
      const userTodosRef = collection(fireStore, `/todos`);
      const q = query(userTodosRef, where("userID", "==", authUser));
      const querySnapshot = await getDocs(q);
      const lists = querySnapshot.docs.map((doc) => doc.data().title);

      return lists;
    } catch (error) {
      console.log("Error getting ToDo lists from Firestore:", error.message);
    }
  };

  const createTasksInFirestore = async (
    authUser,
    taskName,
    taskDescription,
    taskDueDate,
    taskPriority,
    todoTitle
  ) => {
    if (!authUser || !taskName) {
      return;
    }

    try {
      const tasksCollectionRef = collection(fireStore, `tasks`);
      const batch = writeBatch(fireStore);

      const newDocRef = doc(tasksCollectionRef);
      const priorityValue = taskPriority || "Medium"; // Assuming "Medium" as default priority
      const dueDateValue = taskDueDate || null; // Set to null if no due date provided

      batch.set(newDocRef, {
        userID: authUser,
        name: taskName,
        description: taskDescription || null, // Set to null if no description provided
        dueDate: dueDateValue,
        priority: priorityValue,
        todoTitle: todoTitle,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      console.log("Task created in Firestore");
    } catch (error) {
      console.error("Error creating Task in Firestore:", error.message);
    }
  };

  const getTasksFromFirestore = async (userID, todoTitle) => {
    if (!userID) {
      console.log("No user to get Tasks lists for");
      return [];
    }

    try {
      const userTodosRef = collection(fireStore, "tasks");
      const q = query(
        userTodosRef,
        where("userID", "==", userID),
        where("todoTitle", "==", todoTitle)
      );
      const querySnapshot = await getDocs(q);

      const tasks = querySnapshot.docs.map((doc) => {
        const taskData = doc.data();
        return {
          id: doc.id || "",
          name: taskData.name || "",
          description: taskData.description || "",
          dueDate: taskData.dueDate || "",
          priority: taskData.priority || "",
        };
      });

      return tasks;
    } catch (error) {
      console.log("Error getting Tasks lists from Firestore:", error.message);
      return [];
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        signupUser,
        googleSignUp,
        googleSignIn,
        loginUser,
        loggedInUser,
        error,
        clearError,
        logOutUser,
        createToDosInFirestore,
        getToDoLists,
        createTasksInFirestore,
        getTasksFromFirestore,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
