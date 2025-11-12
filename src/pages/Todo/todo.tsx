import React, { useState, useEffect, useCallback } from "react";
import { environment } from "../environment/environment";
import "./todo.css";

interface TodoItem {
  id: number;
  task: string;
  due_date: string;
}

const apiBase = environment.apiUrl;

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("jwt_token");
  const apiUrl = `${apiBase}/app/v1/todo`;

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data || []); // API returns array
    } catch (err: any) {
      setError(err.message || "Error fetching todos");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add todo
  const addTodo = async () => {
    if (!newTask || !newDueDate) return setError("Task and due date required");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tasks: [{ task: newTask, due_date: newDueDate }] }),
      });
      if (!res.ok) throw new Error("Failed to add todo");
      setNewTask("");
      setNewDueDate("");
      fetchTodos();
    } catch (err: any) {
      setError(err.message || "Error adding todo");
    } finally {
      setLoading(false);
    }
  };

  // Delete all todos
  const deleteTodos = async () => {
    if (!window.confirm("Are you sure you want to delete all todos?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to delete todos");
      setTodos([]);
    } catch (err: any) {
      setError(err.message || "Error deleting todos");
    } finally {
      setLoading(false);
    }
  };

  // Delete single todo
  const deleteTodo = async (id: number) => {
    if (!window.confirm("Delete this todo?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err: any) {
      setError(err.message || "Error deleting todo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="todo-container">
      <div className="todo-card">
        <h2>Todo List</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <input type="text" placeholder="Task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
          <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          <button onClick={addTodo} disabled={loading} className="bg-blue-500 hover:bg-blue-600">Add</button>
        </div>

        <ul>
          {todos.length === 0 && <li className="text-gray-400 text-center">No tasks yet</li>}
          {todos.map((todo) => (
            <li key={todo.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl text-white shadow">
              <span>{todo.task}</span>
              <span className="text-gray-300 flex items-center gap-3">
                {todo.due_date}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>

        {todos.length > 0 && (
          <button
            onClick={deleteTodos}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 mt-6 w-full py-3 rounded"
          >
            Delete All Todos
          </button>
        )}
      </div>
    </div>
  );
};

export default Todo;
