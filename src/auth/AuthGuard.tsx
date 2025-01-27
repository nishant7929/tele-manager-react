import { useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// components
import LoadingScreen from '../components/loading-screen';
//
import { useUserContext } from './useUserContext';
import { PATH_AUTH } from '../routes/paths';

// ----------------------------------------------------------------------

type AuthGuardProps = {
	children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
	const { isAuthenticated, isInitialized } = useUserContext();

	const { pathname } = useLocation();

	const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

	if (!isInitialized) {
		return <LoadingScreen />;
	}

	if (!isAuthenticated) {
		if (pathname !== requestedLocation) {
			setRequestedLocation(pathname);
		}
		return <Navigate to={PATH_AUTH.login} />;
	}

	if (requestedLocation && pathname !== requestedLocation) {
		setRequestedLocation(null);
		return <Navigate to={requestedLocation} />;
	}

	return <> {children} </>;
}
