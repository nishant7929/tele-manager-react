// ----------------------------------------------------------------------

type ColorVariants = {
	name: string;
	lighter: string;
	light: string;
	main: string;
	dark: string;
	darker: string;
	contrastText: string;
};

export type ThemeModeValue = 'light' | 'dark';
export type ThemeDirectionValue = 'rtl' | 'ltr';
export type ThemeContrastValue = 'default' | 'bold';
export type ThemeLayoutValue = 'vertical' | 'horizontal' | 'mini';
export type ThemeColorPresetsValue = 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red';
export type ThemeStretchValue = boolean;

export type SettingsValueProps = {
	themeMode: ThemeModeValue;
	themeLayout: ThemeLayoutValue;
	themeStretch: ThemeStretchValue;
	themeContrast: ThemeContrastValue;
	themeDirection: ThemeDirectionValue;
	themeColorPresets: ThemeColorPresetsValue;
};

export type SettingsContextProps = SettingsValueProps & {
	presetsColor: ColorVariants;
	presetsOption: {
		name: string;
		value: string;
	}[];

	// Mode
	onToggleMode: VoidFunction;
	onChangeMode: (__event: React.ChangeEvent<HTMLInputElement>) => void;

	// Direction
	onToggleDirection: VoidFunction;
	onChangeDirection: (__event: React.ChangeEvent<HTMLInputElement>) => void;
	onChangeDirectionByLang: (__lang: string) => void;

	// Layout
	onToggleLayout: VoidFunction;
	onChangeLayout: (__event: React.ChangeEvent<HTMLInputElement>) => void;

	// Contrast
	onToggleContrast: VoidFunction;
	onChangeContrast: (__event: React.ChangeEvent<HTMLInputElement>) => void;

	// Color
	onChangeColorPresets: (__event: React.ChangeEvent<HTMLInputElement>) => void;

	// Stretch
	onToggleStretch: VoidFunction;

	// Reset
	onResetSetting: VoidFunction;
};
