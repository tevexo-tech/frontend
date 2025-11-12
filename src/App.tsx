import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Todo from "./pages/Todo/todo";
import SignIn from "./pages/authentication/signIn";
import SignUp from "./pages/authentication/signUp";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/todo" element={<Todo />} />
      </Routes>
    </Router>
  );
};

export default App;
