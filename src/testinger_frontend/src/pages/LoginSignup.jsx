import React, { useState } from "react";
import "./LoginSignup.css";
import assets from "./assets";

const LoginSignup = () => {
  const [isSignup, setIsSignup] = useState(false);

  const toggleMode = () => setIsSignup(!isSignup);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      email: form.get("email"),
      password: form.get("password"),
      ...(isSignup && { name: form.get("name") }),
    };

    console.log(data);
    // TODO: Send `data` to your Rust/dfx backend endpoint here
  };

  return (
    <div className="login-signup-container">
      {/* Left: Form */}
      <div className="login-signup-left">
        <div className="form-box">
          <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p>
            {isSignup
              ? "Sign up to get started on the decentralized web"
              : "Login to your account on the IC"}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <input name="name" type="text" placeholder="Name" required />
            )}
            <input name="email" type="email" placeholder="Email" required />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
          </form>

          <p className="switch">
            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <span onClick={toggleMode}>{isSignup ? "Login" : "Sign Up"}</span>
          </p>
        </div>
      </div>

      {/* Right: Video or Animation */}
      <div className="login-signup-right">
        <div className="video-box">
          <video
            autoPlay
            muted
            loop
            className="video"
            src={assets.video}
            type="video/mp4"
          >
            Your browser does not support the video tag.
          </video>
          <div className="overlay">
            <h2>Decentralized. Secure. Yours.</h2>
            <p>Powered by Internet Computer & Rust Smart Contracts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
