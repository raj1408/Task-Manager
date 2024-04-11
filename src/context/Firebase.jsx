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
  get,
  getDatabase,
  set,
  ref,
  push,
  onValue,
  remove,
  update,
} from "firebase/database";

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
const firebaseDatabase = getDatabase(firebaseApp);

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
      createUserInRealtimeDB(userCredential.user);
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
      createUserInRealtimeDB(result.user);
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

  const createUserInRealtimeDB = (authUser) => {
    if (authUser && authUser.email && authUser.uid) {
      const usersRef = ref(firebaseDatabase, "users");
      const newUserRef = push(usersRef);
      set(newUserRef, {
        email: authUser.email,
        uid: authUser.uid,
        createdAt: Date.now(),
      })
        .then(() => console.log("User created in Realtime Database"))
        .catch((error) =>
          console.log(
            "Error creating user in Realtime Database:",
            error.message
          )
        );
    }
  };

  const createToDosInRealtimeDB = async (authUser, todoTitle) => {
    if (!authUser || todoTitle === undefined) {
      return;
    }

    try {
      const userTodosRef = ref(firebaseDatabase, `todos`);
      const newTodoRef = push(userTodosRef);
      const titleValue =
        typeof todoTitle === "string" ? todoTitle : "Default Title";
      set(newTodoRef, {
        userID: authUser,
        title: titleValue,
        createdAt: Date.now(),
      });
      console.log("ToDos created in Realtime Database");
    } catch (error) {
      console.log("Error creating ToDos in Realtime Database:", error.message);
    }
  };

  const getToDoLists = async (authUser) => {
    if (!authUser) {
      console.log("No user to get ToDo lists for");
      return [];
    }
    try {
      const userTodosRef = ref(firebaseDatabase, `/todos`);
      const snapshot = await get(userTodosRef); // Change onValue to get
      const todosObj = snapshot.val();
      if (todosObj) {
        const lists = Object.values(todosObj).map((todo) => todo.title);
        return lists;
      } else {
        return [];
      }
    } catch (error) {
      console.log(
        "Error getting ToDo lists from Realtime Database:",
        error.message
      );
      return [];
    }
  };

  const removeTaskFromRealtimeDB = async (authUser, taskID) => {
    if (!authUser || !taskID) {
      return;
    }
    try {
      const taskRef = ref(firebaseDatabase, `tasks/${taskID}`);
      await remove(taskRef);
      console.log("Task removed from Realtime Database");
    } catch (error) {
      console.log("Error removing task from Realtime Database:", error.message);
    }
  };

  const createTasksInRealtimeDB = async (
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
      const tasksRef = ref(firebaseDatabase, `tasks`);
      const newTaskRef = push(tasksRef);
      const priorityValue = taskPriority || "Medium"; // Assuming "Medium" as default priority
      const dueDateValue = taskDueDate || null; // Set to null if no due date provided

      set(newTaskRef, {
        userID: authUser,
        name: taskName,
        description: taskDescription || null, // Set to null if no description provided
        dueDate: dueDateValue,
        priority: priorityValue,
        todoTitle: todoTitle,
        createdAt: Date.now(),
      });
      console.log("Task created in Realtime Database");
    } catch (error) {
      console.error("Error creating Task in Realtime Database:", error.message);
    }
  };

  const getTasksFromRealtimeDB = async (userID, todoTitle) => {
    if (!userID) {
      console.log("No user to get Tasks lists for");
      return [];
    }

    try {
      const tasksRef = ref(firebaseDatabase, "tasks");
      const snapshot = await get(tasksRef); // Changed onValue to get
      const tasksObj = snapshot.val();

      if (!tasksObj) {
        return [];
      }

      const tasks = Object.entries(tasksObj)
        .filter(
          ([key, task]) =>
            task.userID === userID && task.todoTitle === todoTitle
        )
        .map(([key, task]) => ({
          id: key,
          name: task.name || "",
          description: task.description || "",
          dueDate: task.dueDate || "",
          priority: task.priority || "",
        }));
      return tasks;
    } catch (error) {
      console.log("Error getting Tasks from Realtime Database:", error.message);
      return [];
    }
  };

  const editTasksInRealtimeDB = async (
    taskID,
    taskName,
    taskDescription,
    taskDueDate,
    taskPriority
  ) => {
    if (!taskID) {
      console.error("Task ID is required.");
      return;
    }

    try {
      const taskRef = ref(firebaseDatabase, `tasks/${taskID}`);
      const updates = {};

      if (taskName !== "") {
        updates.name = taskName;
      }
      if (taskDescription !== "") {
        updates.description = taskDescription;
      }
      if (taskDueDate !== "") {
        updates.dueDate = taskDueDate;
      }
      if (taskPriority !== "") {
        updates.priority = taskPriority;
      }

      await update(taskRef, updates);
      console.log("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task in Realtime Database:", error);
      // Handle specific types of errors if needed
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
        createToDosInRealtimeDB,
        getToDoLists,
        createTasksInRealtimeDB,
        getTasksFromRealtimeDB,
        removeTaskFromRealtimeDB,
        editTasksInRealtimeDB,
        createUserInRealtimeDB,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
