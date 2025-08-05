import React from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await authService.registerWithEmail(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow p-8 rounded w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">Create Account</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;
