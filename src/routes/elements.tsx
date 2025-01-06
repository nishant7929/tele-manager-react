import { Suspense, lazy, ElementType } from 'react';
// components
import LoadingScreen from '../components/loading-screen';

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: any) =>
	(
		<Suspense fallback={<LoadingScreen />}>
			<Component {...props} />
		</Suspense>
	);

// ----------------------------------------------------------------------

export const LoginPage = Loadable(lazy(() => import('../pages/auth/LoginPage')));
export const VerifyCodePage = Loadable(lazy(() => import('../pages/auth/VerifyCodePage')));

export const FileManagerPage = Loadable(lazy(() => import('../pages/dashboard/FileManagerPage')));
export const EcommerceShopPage = Loadable(lazy(() => import('../pages/dashboard/FileListPage')));
export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
