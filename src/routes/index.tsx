import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
// layouts
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config-global';
//
import {
	Page404,
	FileManagerPage,
	LoginPage,
	VerifyCodePage,
} from './elements';

// ----------------------------------------------------------------------

export default function Router() {
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
						{ path: '/verify', element: <VerifyCodePage /> },
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
			],
		},
		{
			element: <CompactLayout />,
			children: [{ path: '404', element: <Page404 /> }],
		},
		{ path: '*', element: <Navigate to="/404" replace /> },
	]);
}
