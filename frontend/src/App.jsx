import './App.css'
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./components/Home";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import { AuthProvider } from "./components/auth/AuthContext";
import Clock from "./components/Clock";
import Footer from "./components/Footer";
import Compiler from "./components/Compiler";
import  { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
         <AuthProvider>
      <Router>
        <div className="min-h-screen ">
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/compiler" element={<Compiler />} />
          </Routes>
          <Clock />
          <Footer />
        </div>
      </Router>
      <Toaster/>
    </AuthProvider>
    </>
  )
}

export default App
