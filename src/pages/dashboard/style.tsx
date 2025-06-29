export const filePreviewDialogSx = () => ({
	'& .MuiBackdrop-root': {
		backgroundColor: '#1f1f1feb !important',
		opacity: '1 !important',
	},
	'& .MuiDialog-container': {
		// backgroundColor: '#262626',
		// backgroundColor: '#1f1f1feb',
		position: 'relative',
	},
	'& .MuiPaper-rounded': {
		overflow: 'hidden',
		backgroundColor: 'unset',
		borderRadius: '0 !important',
		boxShadow: '0px 4px 15px 2px rgba(0,0,0,0.35)',
		maxWidth: 'unset',
	},
});

export const filePreviewDialogCloseButtonSx = () => ({
	position: 'fixed',
	top: 16,
	right: 16,
	color: '#fff',
	// backgroundColor: 'rgba(0, 0, 0, 0.5)',
	zIndex: 1302,
	'&:hover': {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	},
});

export const filePreviewDialogDownloadButtonSx = () => ({
	position: 'fixed',
	top: 16,
	right: 64,
	color: '#fff',
	// backgroundColor: 'rgba(0, 0, 0, 0.5)',
	zIndex: 1302,
	'&:hover': {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	},
});