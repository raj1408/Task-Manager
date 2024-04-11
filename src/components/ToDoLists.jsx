import React, { useState, useEffect } from "react";
import ToDo from "./ToDo";
import { useFirebase } from "../context/Firebase";

export default function ToDoLists() {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [refresh, setRefresh] = useState(false);
  const firebase = useFirebase();

  const handleInputChange = (e) => {
    setNewListTitle(e.target.value);
  };

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const loggedInUserId = firebase.loggedInUser()?.uid;
        if (!loggedInUserId) {
          console.error("User is not logged in.");
          return;
        }

        const fetchedLists = await firebase.getToDoLists(loggedInUserId);
        if (Array.isArray(fetchedLists)) {
          setLists(fetchedLists);
        } else {
          console.error("Fetched ToDo lists is not an array.");
        }
      } catch (error) {
        console.error("Error fetching ToDo lists:", error);
      }
    };

    fetchLists();
  }, [firebase, refresh]);

  const addList = async () => {
    if (newListTitle.trim() !== "") {
      try {
        await firebase.createToDosInRealtimeDB(
          firebase.loggedInUser()?.uid,
          newListTitle
        );
        setNewListTitle("");
      } catch (error) {
        console.error("Error creating new list:", error.message);
      }
    }
    setRefresh(true);
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
