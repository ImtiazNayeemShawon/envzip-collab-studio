import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/loading';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

export const ProtectedRoute = ({ 
    children, 
    requireAuth = true, 
    redirectTo = '/login' 
}: ProtectedRouteProps) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return <LoadingSpinner />;
    }

    // If route requires auth and user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If route doesn't require auth and user is authenticated (like login page)
    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};