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

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const { username, password } = loginState;

    if (username === "Afia" && password === "123") {
      onLoginSuccess();
    } else {
      alert("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-100 flex justify-center items-center">
      <div className="w-full max-w-4xl h-auto md:h-[550px] flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full md:w-[45%] h-full bg-white flex flex-col justify-center items-center p-8">
          <img src={Logo} alt="Logo" className="w-48 object-contain mb-6" />
          <h1 className="text-3xl font-bold tracking-wider text-center text-emerald-600">
            EMRChains
          </h1>
        </div>

        <div className="w-full md:w-[55%] h-full flex flex-col justify-center items-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-500 mb-8">Sign in to continue.</p>

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
