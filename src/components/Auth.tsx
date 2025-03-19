import { useAuth } from "../context/AuthContext";

const Auth = () => {
  const { user, loginWithGoogle, logout } = useAuth();

  console.log(user);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {user ? (
        <div className="text-center">
          <img
            src={user.photoURL || ""}
            alt="Profile"
            className="w-16 h-16 rounded-full mb-2"
          />
          <h2>Welcome, {user.displayName?.toLocaleUpperCase()}</h2>
          <p className="text-gray-600">{user.email}</p>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={loginWithGoogle}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login with Google
        </button>
      )}
    </div>
  );
};

export default Auth;
