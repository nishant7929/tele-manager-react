import { useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
import { useUserContext } from '../auth/useUserContext';
// layouts
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config-global';
//
import {
	Page404,
	LoginPage,
} from './elements';
import FileManagerPage from '../pages/dashboard/FileManagerPage';
import FileListPage from '../pages/dashboard/FileListPage';
import Home from '../pages/dashboard/Home';
import ImageView from '../pages/dashboard/ImageView';
import { getUserData } from '../redux/slices/user';
import { useDispatch } from '../redux/store';

// ----------------------------------------------------------------------

export default function Router() {
	const { user } = useUserContext();
	const dispatch = useDispatch();
	useEffect(() => {
		if (user) {
			dispatch(getUserData(user.tgId));
		}
	}, [user, dispatch]);

	return useRoutes([
		{
			path: '/',
			children: [
				{ element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
				{
					element: (
						<GuestGuard>
							<CompactLayout />
						</GuestGuard>
					),
					children: [
						{ path: '/login', element: <LoginPage /> },
					],
				},
			],
		},
		{
			path: '/',
			element: <Navigate to="/folders" replace />,
		},
		{
			path: '/',
			element: (
				<AuthGuard>
					<DashboardLayout />
				</AuthGuard>
			),
			children: [
				{ element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
				{ path: '/folders', element: <FileManagerPage /> },
				{ path: '/folder/:id', element: <FileListPage /> },
				{ path: '/telegram', element: <Home /> },
				{ path: '/image/:id', element: <ImageView /> },
			],
		},
		{
			element: <CompactLayout />,
			children: [{ path: '404', element: <Page404 /> }],
		},
		{ path: '*', element: <Navigate to="/404" replace /> },
	]);
}
