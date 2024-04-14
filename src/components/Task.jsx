import React, { useState } from "react";
import { useFirebase } from "../context/Firebase";

export default function Task(props) {
  const firebase = useFirebase();
  return (
    <div
      draggable="true"
      className="task"
      onDragStart={(e) => {
        firebase.handleDragStart(props?.id);
      }}
    >
      <p>Title:- {props.taskName}</p>
      <p>Description:- {`"${props.description}"`}</p>
      <p>Due Date:- {props.dueDate}</p>
      <p>Priority:- {props.priority}</p>
      <div className="buttons">
        <button
          className="delete"
          onClick={() => {
            props.deleteTask(props?.id);
          }}
        >
          Delete Task
        </button>
        <button onClick={props.togglePopup} className="edit">
          Edit Task
        </button>
      </div>
    </div>
  );
}
