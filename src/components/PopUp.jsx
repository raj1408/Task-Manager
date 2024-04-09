import React from "react";

export default function PopUp(props) {
  return (
    <div
      className="overlay"
      style={{ display: props.isOpen ? "flex" : "none" }}
    >
      <div className="popup-box">
        <span className="close-btn" onClick={props.togglePopup}>
          &times;
        </span>
        <input
          onChange={props.handleChangeName}
          type="text" // Changed from " text" to "text"
          placeholder="Title"
        />
        <textarea // Changed from "text-area" to "textarea"
          onChange={props.handleChangeDescription}
          placeholder="Description"
        />
        <input
          onChange={props.handleChangeDueDate}
          type="text"
          placeholder="Due Date"
        />
        <input
          onChange={props.handleChangePriority}
          type="text"
          placeholder="Priority"
        />
        <div className="buttons">
          <button className="edit_task" onClick={props.handleAddTask}>
            Add new Task
          </button>
          <button className="edit_task" onClick={props.updateTask}>
            Edit current task
          </button>
        </div>
      </div>
    </div>
  );
}
