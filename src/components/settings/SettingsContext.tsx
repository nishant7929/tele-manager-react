import { ReactNode, createContext, useEffect, useContext, useMemo, useCallback, useState } from 'react';
// hooks
// import useLocalStorage from '../../hooks/useLocalStorage';
// utils
import localStorageAvailable from '../../utils/localStorageAvailable';
//
import { defaultSettings } from './config-setting';
import { SettingsContextProps, ThemeColorPresetsValue, ThemeContrastValue, ThemeDirectionValue, ThemeLayoutValue, ThemeModeValue } from './types';
import { defaultPreset, getPresets, presetsOption } from './presets';

// ----------------------------------------------------------------------

const initialState: SettingsContextProps = {
	...defaultSettings,
	// Mode
	onToggleMode: () => {},
	onChangeMode: () => {},
	// Direction
	onToggleDirection: () => {},
	onChangeDirection: () => {},
	onChangeDirectionByLang: () => {},
	// Layout
	onToggleLayout: () => {},
	onChangeLayout: () => {},
	// Contrast
	onToggleContrast: () => {},
	onChangeContrast: () => {},
	// Color
	onChangeColorPresets: () => {},
	presetsColor: defaultPreset,
	presetsOption: [],
	// Stretch
	onToggleStretch: () => {},
	// Reset
	onResetSetting: () => {},
};

// ----------------------------------------------------------------------

export const SettingsContext = createContext(initialState);

export const useSettingsContext = () => {
	const context = useContext(SettingsContext);

	if (!context) {
		throw new Error('useSettingsContext must be use inside SettingsProvider');
	}

	return context;
};

// ----------------------------------------------------------------------

type SettingsProviderProps = {
	children: ReactNode;
};

export function SettingsProvider({ children }: SettingsProviderProps) {
	const [settings, setSettings] = useState(defaultSettings);

	const storageAvailable = localStorageAvailable();

	const langStorage = storageAvailable ? localStorage.getItem('i18nextLng') : '';

	const isArabic = langStorage === 'ar';

	useEffect(() => {
		if (isArabic) {
			onChangeDirectionByLang('ar');
		}
	}, [isArabic]);

	// Mode
	const onToggleMode = useCallback(() => {
		const themeMode = settings.themeMode === 'light' ? 'dark' : 'light';
		setSettings({ ...settings, themeMode });
	}, [setSettings, settings]);

	const onChangeMode = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const themeMode = event.target.value;
			setSettings({ ...settings, themeMode: themeMode as ThemeModeValue });
		},
		[setSettings, settings]
	);

	// Direction
	const onToggleDirection = useCallback(() => {
		const themeDirection = settings.themeDirection === 'rtl' ? 'ltr' : 'rtl';
		setSettings({ ...settings, themeDirection: themeDirection as ThemeDirectionValue });
	}, [setSettings, settings]);

	const onChangeDirection = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const themeDirection = event.target.value;
			setSettings({ ...settings, themeDirection: themeDirection as ThemeDirectionValue });
		},
		[setSettings, settings]
	);

	const onChangeDirectionByLang = useCallback(
		(lang: string) => {
			const themeDirection = lang === 'ar' ? 'rtl' : 'ltr';
			setSettings({ ...settings, themeDirection });
		},
		[setSettings, settings]
	);

	// Layout
	const onToggleLayout = useCallback(() => {
		const themeLayout = settings.themeLayout === 'vertical' ? 'mini' : 'vertical';
		setSettings({ ...settings, themeLayout });
	}, [setSettings, settings]);

	const onChangeLayout = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const themeLayout = event.target.value;
			setSettings({ ...settings, themeLayout: themeLayout as ThemeLayoutValue });
		},
		[setSettings, settings]
	);

	// Contrast
	const onToggleContrast = useCallback(() => {
		const themeContrast = settings.themeContrast === 'default' ? 'bold' : 'default';
		setSettings({ ...settings, themeContrast });
	}, [setSettings, settings]);

	const onChangeContrast = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const themeContrast = event.target.value;
			setSettings({ ...settings, themeContrast: themeContrast as ThemeContrastValue });
		},
		[setSettings, settings]
	);

	// Color
	const onChangeColorPresets = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const themeColorPresets = event.target.value;
			setSettings({ ...settings, themeColorPresets: themeColorPresets as ThemeColorPresetsValue });
		},
		[setSettings, settings]
	);

	// Stretch
	const onToggleStretch = useCallback(() => {
		const themeStretch = !settings.themeStretch;
		setSettings({ ...settings, themeStretch });
	}, [setSettings, settings]);

	// Reset
	const onResetSetting = useCallback(() => {
		setSettings(defaultSettings);
	}, [setSettings]);

	const memoizedValue = useMemo(
		() => ({
			...settings,
			// Mode
			onToggleMode,
			onChangeMode,
			// Direction
			onToggleDirection,
			onChangeDirection,
			onChangeDirectionByLang,
			// Layout
			onToggleLayout,
			onChangeLayout,
			// Contrast
			onChangeContrast,
			onToggleContrast,
			// Stretch
			onToggleStretch,
			// Color
			onChangeColorPresets,
			presetsOption,
			presetsColor: getPresets(settings.themeColorPresets),
			// Reset
			onResetSetting,
		}),
		[
			settings,
			// Mode
			onToggleMode,
			onChangeMode,
			// Direction
			onToggleDirection,
			onChangeDirection,
			onChangeDirectionByLang,
			// Layout
			onToggleLayout,
			onChangeLayout,
			onChangeContrast,
			// Contrast
			onToggleContrast,
			// Stretch
			onToggleStretch,
			// Color
			onChangeColorPresets,
			// Reset
			onResetSetting,
		]
	);

	return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
