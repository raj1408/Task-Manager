import React, { useState, useEffect } from "react";

import PopUp from "./PopUp";
import Priority_Container from "./Priority_Container";
import { useFirebase } from "../context/Firebase";

export default function ToDo(props) {
  const [refresh, setRefresh] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("");

  const firebase = useFirebase();

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleChangeName = (e) => {
    setNewTaskName(e.target.value);
  };

  const handleChangeDescription = (e) => {
    setNewTaskDescription(e.target.value);
  };

  const handleChangeDueDate = (e) => {
    setNewTaskDueDate(e.target.value);
  };

  const handleChangePriority = (e) => {
    setNewTaskPriority(e.target.value);
  };

  const addTask = async () => {
    try {
      const loggedInUserId = firebase.loggedInUser()?.uid;
      const taskName = newTaskName;
      const taskDescription = newTaskDescription;
      const taskDueDate = newTaskDueDate;
      const taskPriority = newTaskPriority;
      if (!loggedInUserId) {
        console.error("User is not logged in.");
        return;
      }

      await firebase.createTasksInFirestore(
        loggedInUserId,
        taskName,
        taskDescription,
        taskDueDate,
        taskPriority,
        props?.ListName,
        props?.id
      );
      console.log("Task added successfully.");
      setNewTaskName("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setNewTaskPriority("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating new task:", error.message);
    }
    setRefresh(true);
  };

  const deleteTask = async (taskID) => {
    try {
      const loggedInUserId = firebase.loggedInUser()?.uid;
      if (!loggedInUserId) {
        console.error("User is not logged in.");
        return;
      }
      await firebase.removeTaskFromFirestore(loggedInUserId, taskID);
      console.log("Task deleted successfully.");
    } catch (error) {
      console.error("Error deleting task:", error.message);
    }
    setRefresh(true);
  };

  const updateTask = async (taskID) => {
    try {
      const loggedInUserId = firebase.loggedInUser()?.uid;
      if (!loggedInUserId) {
        console.error("User is not logged in.");
        return;
      }
      await firebase.editTasksInFirestore(
        newTaskName,
        newTaskDescription,
        newTaskDueDate,
        newTaskPriority
      );
      console.log("Task updated successfully.");
      setNewTaskName("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setNewTaskPriority("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating task:", error.message);
    }
    setRefresh(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const tasksList = await firebase.getTasksFromFirestore(
        firebase.loggedInUser()?.uid,
        props.ListName
      );
      setTasks(tasksList);
    };

    fetchData();
  }, [props.userID, props.todoTitle, tasks, refresh]); // Add tasks to the dependency array

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    await firebase.onDropUpdate(props.ListName);
  };

  const deleteToDo = async (todoID, ListName) => {
    const loggedInUser = await firebase.loggedInUser()?.uid;
    if (!loggedInUser) {
      console.log("User is not logged in.");
      return;
    }
    try {
      await firebase.deleteToDos(todoID, ListName);
      console.log("Deleted Todo successfully.");
    } catch (error) {
      console.error("Error deleting todo ", error);
    }
    setRefresh(true);
  };
  return (
    <>
      <div className="todo" onDragOver={handleDragOver} onDrop={handleDrop}>
        <button
          className="delete toDo-delete"
          onClick={() => deleteToDo(props.id, props.ListName)}
        >
          Delete ToDo
        </button>
        <div className="tasks">
          <div className="headers">
            <h3>{props.ListName}</h3>
            <button onClick={togglePopup} className="add-tasks">
              Add Task
            </button>
            <PopUp
              togglePopup={togglePopup}
              isOpen={isOpen}
              handleAddTask={addTask}
              handleChangeName={handleChangeName}
              handleChangeDueDate={handleChangeDueDate}
              handleChangePriority={handleChangePriority}
              handleChangeDescription={handleChangeDescription}
              updateTask={updateTask}
            />
          </div>

          <Priority_Container
            priority="High"
            tasks={tasks}
            togglePopup={togglePopup}
            deleteTask={deleteTask}
          />
          <Priority_Container
            priority="Medium"
            tasks={tasks}
            togglePopup={togglePopup}
            deleteTask={deleteTask}
          />
          <Priority_Container
            priority="Low"
            tasks={tasks}
            togglePopup={togglePopup}
            deleteTask={deleteTask}
          />
        </div>
      </div>
    </>
  );
}
