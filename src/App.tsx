// scroll bar
import 'simplebar/src/simplebar.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------

import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
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

import { UserProvider } from './auth/UserContext';
import { store } from './redux/store';

// ----------------------------------------------------------------------

export default function App() {
	return (
		<UserProvider>
			<HelmetProvider>
				<ReduxProvider store={store}>
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
				</ReduxProvider>
			</HelmetProvider>
		</UserProvider>
	);
}
