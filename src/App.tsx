// i18n
import './locales/i18n';

// scroll bar
import 'simplebar/src/simplebar.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------

import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// locales
import ThemeLocalization from './locales';
// components
import SnackbarProvider from './components/snackbar';
import ScrollToTop from './components/scroll-to-top';
import { MotionLazyContainer } from './components/animate';
import { ThemeSettings, SettingsProvider } from './components/settings';

// Check our docs
// https://docs.minimals.cc/authentication/ts-version

import { AuthProvider } from './auth/JwtContext';
import { persistor, store } from './redux/store';

// ----------------------------------------------------------------------

export default function App() {
	return (
		<AuthProvider>
			<HelmetProvider>
				<ReduxProvider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<SettingsProvider>
							<BrowserRouter>
								<ScrollToTop />
								<MotionLazyContainer>
									<ThemeProvider>
										<ThemeSettings>
											<ThemeLocalization>
												<SnackbarProvider>
													<Router />
												</SnackbarProvider>
											</ThemeLocalization>
										</ThemeSettings>
									</ThemeProvider>
								</MotionLazyContainer>
							</BrowserRouter>
						</SettingsProvider>
					</PersistGate>
				</ReduxProvider>
			</HelmetProvider>
		</AuthProvider>
	);
}
