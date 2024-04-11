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
          type="date" // Changed from "date" to "date"
        />
        <select
          onChange={props.handleChangePriority}
          defaultValue="" // Set a default value or handle it based on your logic
          placeholder="Priority"
        >
          <option value="" disabled>
            Select Priority
          </option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
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
