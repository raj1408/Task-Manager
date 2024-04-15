import React from "react";
import Task from "./Task";
import { useFirebase } from "../context/Firebase";

export default function Priority_Container(props) {
  const { tasks, priority, togglePopup, deleteTask } = props;
  const filteredTasks = tasks.filter((task) => task.priority === priority);

  const firebase = useFirebase();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    await firebase.onDropUpdatePriority(priority);
  };
  return (
    <div className="todo" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h3>{priority}</h3>
      {filteredTasks.map((task, index) => (
        <Task
          taskName={task.name}
          description={task.description}
          dueDate={task.dueDate}
          priority={task.priority}
          key={index}
          id={task.id}
          togglePopup={togglePopup}
          deleteTask={deleteTask}
        />
      ))}
    </div>
  );
}
