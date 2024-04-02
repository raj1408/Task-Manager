import React, { useState, useEffect } from "react";
import ToDo from "./ToDo";
import { useFirebase } from "../context/Firebase";

export default function ToDoLists() {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const firebase = useFirebase();

  const handleInputChange = (e) => {
    setNewListTitle(e.target.value);
  };

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const fetchedLists = await firebase.getToDoLists(
          firebase.loggedInUser()?.uid
        );
        setLists(fetchedLists || []); // Ensure that fetchedLists is an array, otherwise set an empty array
      } catch (error) {
        console.error("Error fetching ToDo lists:", error);
      }
    };

    fetchLists();
  }, [firebase]);

  const addList = async () => {
    if (newListTitle.trim() !== "") {
      try {
        await firebase.createToDosInFirestore(
          firebase.loggedInUser()?.uid,
          newListTitle
        );
        setNewListTitle("");
      } catch (error) {
        console.error("Error creating new list:", error.message);
      }
    }
  };

  return (
    <>
      <div className="add-lists">
        <input
          value={newListTitle}
          onChange={handleInputChange}
          type="text"
          placeholder="Add new ToDo list"
        />
        <button onClick={addList}>Add List</button>
        <button onClick={firebase.logOutUser}>Log Out</button>
      </div>
      <div className="todo-lists">
        {lists.map((list, index) => (
          <ToDo key={index} ListName={list} />
        ))}
      </div>
    </>
  );
}
