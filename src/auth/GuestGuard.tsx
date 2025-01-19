import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
// components
import LoadingScreen from '../components/loading-screen';
//
import { useUserContext } from './useUserContext';

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
	const { isAuthenticated, isInitialized } = useUserContext();

	if (isAuthenticated) {
		return <Navigate to="/" />;
	}

	if (!isInitialized) {
		return <LoadingScreen />;
	}

	return <> {children} </>;
}
