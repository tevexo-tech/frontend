import React, { useState, useEffect, useCallback } from "react";
import { environment } from "../environment/environment";
import "./todo.css";
import ConfirmModal from "../../components/popup";


interface TodoItem {
  id: number;
  task: string;
  due_date: string;
  status: "backlog" | "today" | "tomorrow" | "in-progress" | "done";
}

const apiBase = environment.apiUrl;

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);

  const token = localStorage.getItem("jwt_token");
  const apiUrl = `${apiBase}/app/v1/todo`;

  const columns: TodoItem["status"][] = ["backlog", "today", "tomorrow", "in-progress", "done"];

  // ---------- Fetch todos ----------
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data: TodoItem[] = await res.json();
      setTodos(data);
    } catch (err: any) {
      setError(err.message || "Error fetching todos");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ---------- Add todo ----------
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

      const newTodo: TodoItem = {
        id: Date.now(),
        task: newTask,
        due_date: newDueDate,
        status: "backlog",
      };
      setTodos((prev) => [...prev, newTodo]);
      setNewTask("");
      setNewDueDate("");
    } catch (err: any) {
      setError(err.message || "Error adding todo");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Delete single todo ----------
  const deleteTodo = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err: any) {
      setError(err.message || "Error deleting todo");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Update status ----------
  const updateStatus = async (id: number, status: TodoItem["status"]) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, status } : todo)));

    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error updating status");
      fetchTodos(); // rollback
    }
  };

  return (
    <div className="kanban-container">
      {/* Add Task */}
      <div className="add-task-card">
        <h2 className="text-2xl font-semibold text-white mb-4">Add New Task</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="input-field"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="input-field"
          />
          <button onClick={addTodo} disabled={loading} className="btn-add">
            Add
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board flex gap-6 mt-8 overflow-x-auto">
        {columns.map((col) => (
          <div key={col} className="kanban-column min-w-[220px]">
            <h3 className="text-white font-semibold mb-4">{col.toUpperCase()}</h3>
            <div className="space-y-3">
              {todos
                .filter((todo) => todo.status === col)
                .map((todo) => (
                  <div key={todo.id} className="kanban-card">
                    <h4 className="text-white font-medium">{todo.task}</h4>
                    <p className="text-gray-400 text-sm mt-1">{todo.due_date}</p>
                    <div className="flex gap-2 mt-2">
                      <select
                        value={todo.status}
                        onChange={(e) => updateStatus(todo.id, e.target.value as TodoItem["status"])}
                        className="bg-gray-700 text-white text-sm rounded p-1 flex-1"
                      >
                        {columns.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setTodoToDelete(todo.id);
                          setShowConfirm(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {showConfirm && todoToDelete !== null && (
        <ConfirmModal
          message="Do you really want to delete this task? This action cannot be undone."
          onCancel={() => {
            setShowConfirm(false);
            setTodoToDelete(null);
          }}
          onConfirm={() => {
            if (todoToDelete !== null) deleteTodo(todoToDelete);
            setShowConfirm(false);
            setTodoToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default Todo;
