import React from "react";

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
      <p>Due Dtae:- {props.dueDate}</p>
      <p>Priority:- {props.priority}</p>
    </div>
  );
}
