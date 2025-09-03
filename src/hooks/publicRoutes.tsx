import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/loading';

interface PublicRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

export const PublicRoute = ({ children, redirectTo = '/dashboard' }: PublicRouteProps) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};