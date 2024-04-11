import React, { useState, useEffect } from "react";

import Task from "./Task";
import PopUp from "./PopUp";
import { useFirebase } from "../context/Firebase";

export default function ToDo(props) {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
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

      await firebase.createTasksInRealtimeDB(
        loggedInUserId,
        taskName,
        taskDescription,
        taskDueDate,
        taskPriority,
        props?.ListName
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
  };

  const deleteTask = async (taskID) => {
    try {
      const loggedInUserId = firebase.loggedInUser()?.uid;
      if (!loggedInUserId) {
        console.error("User is not logged in.");
        return;
      }
      await firebase.removeTaskFromRealtimeDB(loggedInUserId, taskID);
      console.log("Task deleted successfully.");
    } catch (error) {
      console.error("Error deleting task:", error.message);
    }
  };

  const updateTask = async (taskID) => {
    try {
      const loggedInUserId = firebase.loggedInUser()?.uid;
      if (!loggedInUserId) {
        console.error("User is not logged in.");
        return;
      }
      await firebase.editTasksInRealtimeDB(
        loggedInUserId,
        taskID,
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
  };

  useEffect(() => {
    const fetchData = async () => {
      const tasksList = await firebase.getTasksFromRealtimeDB(
        firebase.loggedInUser()?.uid,
        props.ListName
      );
      setTasks(tasksList);
    };

    fetchData();
  }, [props.userID, props.todoTitle, tasks]); // Add tasks to the dependency array

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTasks((oldList) => {
        const oldIndex = oldList.findIndex((item) => item.id === active.id);
        const newIndex = oldList.findIndex((item) => item.id === over.id);
        return arrayMove(oldList, oldIndex, newIndex);
      });
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
  };

  useEffect(() => {
    setDraggedTask(draggedTask);
  }, [draggedTask]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedTask) {
      const isTaskInTasks = tasks.some((task) => task.id === draggedTask.id);
      if (!isTaskInTasks) {
        const updatedTasks = [...tasks, draggedTask];
        setTasks(updatedTasks);
        setDraggedTask(null); // Set dragged task to null after updating tasks
      } else {
        console.warn("Task already exists in tasks array.");
      }
    }
  };

  return (
    <>
      <div className="todo" onDragOver={handleDragOver} onDrop={handleDrop}>
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

          {tasks.map((task, index) => (
            <Task
              taskName={task.name}
              description={task.description}
              dueDate={task.dueDate}
              priority={task.priority}
              key={index}
              id={task.id}
              handleDragStart={handleDragStart}
              togglePopup={togglePopup}
              deleteTask={deleteTask}
            />
          ))}
        </div>
      </div>
    </>
  );
}
