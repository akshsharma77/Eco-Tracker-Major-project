import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  // 1. Not logged in -> Redirect to login page immediately
  if (!token || !storedUser) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location.pathname,
          message: 'Access restricted. Please sign in to your account first.' 
        }} 
      />
    );
  }

  let user = null;
  try {
    user = JSON.parse(storedUser);
  } catch (e) {
    // Corrupted user data in storage -> clean and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location.pathname,
          message: 'Session invalid. Please sign in again.' 
        }} 
      />
    );
  }

  // 2. Check role authorization if specific roles are required
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location.pathname,
          message: `Access denied: This section requires ${allowedRoles.join(' or ')} credentials. Your current role is ${user.role}.` 
        }} 
      />
    );
  }

  // 3. User is valid and authorized -> Render protected component
  return children;
};

export default ProtectedRoute;
