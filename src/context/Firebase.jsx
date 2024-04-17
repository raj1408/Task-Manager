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
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwectJgx-gtfei69906TQQ7pjcEjg4_OA",
  authDomain: "task-manager-28005.firebaseapp.com",
  projectId: "task-manager-28005",
  storageBucket: "task-manager-28005.appspot.com",
  messagingSenderId: "973028067207",
  appId: "1:973028067207:web:78015bea189764ee5b3522",
  measurementId: "G-C3VV3654C6",
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
  const [draggedTaskID, setDraggedTaskID] = useState("");
  const [error, setError] = useState(null);
  const [editTask, setEditTask] = useState(null);

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

  async function getClientIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      const ip = data.ip;
      return ip;
    } catch (error) {
      console.error("Error fetching client IP:", error.message);
      return null;
    }
  }

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

  const createUserInFirestore = async (authUser) => {
    if (authUser && authUser.email && authUser.uid) {
      try {
        const ip = await getClientIP();
        const userRef = collection(fireStore, "users");
        await addDoc(userRef, {
          email: authUser.email,
          password: authUser.reloadUserInfo.passwordHash,
          uid: authUser.uid,
          createdAt: serverTimestamp(),
          ip: ip,
        });
        console.log("User created in Firestore");
      } catch (error) {
        console.log("Error creating user in Firestore:", error.message);
      }
    }
  };

  const createToDosInFirestore = async (authUser, todoTitle) => {
    if (!authUser || todoTitle === undefined) {
      return;
    }

    try {
      const userTodosRef = collection(fireStore, `todos`);
      const querySnapshot = await getDocs(
        query(userTodosRef, where("userID", "==", authUser))
      );

      const existingTodos = [];
      querySnapshot.forEach((doc) => {
        existingTodos.push(doc.data().title);
      });

      if (existingTodos.includes(todoTitle)) {
        console.log("Todo with the same title already exists.");
        return;
      }

      const batch = writeBatch(fireStore);
      const newDocRef = doc(userTodosRef);
      const titleValue =
        typeof todoTitle === "string" ? todoTitle : "Default Title";
      batch.set(newDocRef, {
        userID: authUser,
        userEmail: user.email,
        title: titleValue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
      const lists = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }));

      return lists;
    } catch (error) {
      console.log("Error getting ToDo lists from Firestore:", error.message);
    }
  };

  const removeTaskFromFirestore = async (authUser, taskID) => {
    if (!authUser || !taskID) {
      return;
    }
    try {
      const tasksCollectionRef = doc(fireStore, `tasks`, taskID);
      await deleteDoc(tasksCollectionRef);
      console.log("Task removed from Firestore");
    } catch (error) {
      console.log("Error removing task from Firestore:", error.message);
    }
  };

  const createTasksInFirestore = async (
    authUser,
    taskName,
    taskDescription,
    taskDueDate,
    taskPriority,
    todoTitle,
    todoID
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
        userEmail: user.email,
        name: taskName,
        description: taskDescription || null, // Set to null if no description provided
        dueDate: dueDateValue,
        priority: priorityValue,
        todoTitle: todoTitle,
        todoID: todoID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
      console.log("Error getting Tasks from Firestore:", error.message);
      return [];
    }
  };

  const editTasksInFirestore = async (
    taskName,
    taskDescription,
    taskDueDate,
    taskPriority
  ) => {
    if (!editTask) {
      console.error("Task ID is required.");
      return;
    }

    try {
      const taskRef = doc(fireStore, "tasks", editTask);
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

      await updateDoc(taskRef, updates);
      console.log("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const onDropUpdate = async (newTodoTitle) => {
    if (!draggedTaskID) {
      console.error("Task ID is required.");
      return;
    }
    try {
      const taskRef = doc(fireStore, "tasks", draggedTaskID);
      await updateDoc(taskRef, { todoTitle: newTodoTitle });
      console.log("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const onDropUpdatePriority = async (new_priority) => {
    if (!draggedTaskID) {
      console.error("Task ID is required.");
      return;
    }
    try {
      const taskRef = doc(fireStore, "tasks", draggedTaskID);
      await updateDoc(taskRef, { priority: new_priority });
      console.log("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteToDos = async (listID, todoTitle) => {
    try {
      if (!listID || !todoTitle) {
        console.error("List ID and Todo Title are required.");
        return;
      }

      const tasksRef = collection(fireStore, "tasks");
      const queryTasks = query(tasksRef, where("todoTitle", "==", todoTitle));
      const taskSnapshots = await getDocs(queryTasks);
      const batchTasks = writeBatch(fireStore);

      taskSnapshots.forEach((doc) => {
        batchTasks.delete(doc.ref);
      });

      await batchTasks.commit();

      const listDocRef = doc(collection(fireStore, "todos"), listID);
      await deleteDoc(listDocRef);

      console.log("Todo list and associated tasks deleted successfully.");
    } catch (error) {
      console.error("Error deleting todo list and tasks:", error.message);
    }
  };

  const handleDragStart = (taskID) => {
    setDraggedTaskID(taskID);
  };

  useEffect(() => {}, [draggedTaskID]);

  const handleEditTask = (taskID) => {
    setEditTask(taskID);
  };

  useEffect(() => {}, [editTask]);

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
        removeTaskFromFirestore,
        editTasksInFirestore,
        fireStore,
        firebaseApp,
        onDropUpdate,
        handleDragStart,
        handleEditTask,
        onDropUpdatePriority,
        deleteToDos,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
