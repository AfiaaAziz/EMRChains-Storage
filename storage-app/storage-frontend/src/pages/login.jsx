import React, { useState } from "react";
import Logo from "../assets/images/logo.png";

const Login = ({ onLoginSuccess }) => {
  const [loginState, setLoginState] = useState({
    username: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    setLoginState({
      ...loginState,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = loginState;

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        
        onLoginSuccess();
      } else {
        
        alert(
          data.message || "Invalid username or password. Please try again."
        );
      }
    } catch (error) {
      console.error("Login request failed:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="w-screen min-h-screen bg-slate-100 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl min-h-[500px] md:h-[550px] flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full md:w-[45%] h-full bg-white flex flex-col justify-center items-center p-6 text-center md:p-8">
          <img
            src={Logo}
            alt="Logo"
            className="w-32 sm:w-40 md:w-48 object-contain mb-4 md:mb-6"
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-emerald-600">
            EMRChains
          </h1>
        </div>

        <div className="w-full md:w-[55%] h-full flex flex-col justify-center items-center p-6 sm:p-8 md:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-500 mb-6 sm:mb-8">Sign in to continue.</p>

            <form
              onSubmit={handleLoginSubmit}
              className="w-full flex flex-col gap-4"
            >
              <input
                required
                onChange={handleLoginChange}
                value={loginState.username}
                type="text"
                name="username"
                placeholder="Username"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200"
              />

              <input
                required
                onChange={handleLoginChange}
                value={loginState.password}
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200"
              />

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white p-3 rounded-lg font-semibold text-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-md"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
