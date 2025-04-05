import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthContext/ContextApi"; // Import Auth Context

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
