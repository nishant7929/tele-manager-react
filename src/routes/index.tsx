import { useEffect, useState } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
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
import { Page404, LoginPage } from './elements';
import FileManagerPage from '../pages/dashboard/FileManagerPage';
import FileListPage from '../pages/dashboard/FileListPage';
import Home from '../pages/dashboard/Home';
// import ImageView from '../pages/dashboard/ImageView';
import { getUserData } from '../redux/slices/user';
import { useDispatch, useSelector } from '../redux/store';
import ReactGA from 'react-ga4';
import { userModel } from '../utils/firebase';
// ----------------------------------------------------------------------

const initializeGA = () => {
	ReactGA.initialize(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);
};

initializeGA();

export default function Router() {
	const [firstLoad, setFirstLoad] = useState(true);
	const { user, tgMessages } = useUserContext();
	const { user: firebaseUser } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const location = useLocation();

	useEffect(() => {
		if (firstLoad && tgMessages.length && firebaseUser) {
			if (firebaseUser.totalFiles !== tgMessages.length) {
				userModel.findByIdAndUpdate(firebaseUser.uid, {
					...firebaseUser,
					totalFiles: tgMessages.length,
				});
			}
			setFirstLoad(false);
		}
	}, [tgMessages, firebaseUser]);

	useEffect(() => {
		if (user) {
			dispatch(getUserData(`${user.tgId}${user.phoneNumber.slice(-5)}`));
		}
	}, [user, dispatch]);

	useEffect(() => {
		ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
	}, [location]);

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
					children: [{ path: '/login', element: <LoginPage /> }],
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
				// { path: '/image/:id', element: <ImageView /> },
			],
		},
		{
			element: <CompactLayout />,
			children: [{ path: '404', element: <Page404 /> }],
		},
		{ path: '*', element: <Navigate to="/404" replace /> },
	]);
}
