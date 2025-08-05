import React, { useEffect, useState } from "react";
import { getUsers, createUser } from "../components/services/userService"

const UserComponent = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  // Create User
  const handleCreateUser = async () => {
    try {
      const newUser = { name: "John Doe", email: "john@example.com" };
      const createdUser = await createUser(newUser);
      setUsers((prev) => [...prev, createdUser]);
    } catch (err) {
      setError("Failed to create user.");
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <h1 className="text-xl font-bold">User List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
      <button onClick={handleCreateUser} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Add User
      </button>
    </div>
  );
};

export default UserComponent;
