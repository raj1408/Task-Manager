import React, { useState } from "react";

export default function Task(props) {
  return (
    <div
      draggable
      className="task"
      onDragStart={(e) => {
        props?.handleDragStart(e, props);
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
