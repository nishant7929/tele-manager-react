import { memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import { IconButton, LinearProgress, Stack, Typography } from '@mui/material';
// utils
import { fData } from '../../../utils/formatNumber';
//
import Iconify from '../../iconify';
import { varFade } from '../../animate';
import FileThumbnail, { fileData } from '../../file-thumbnail';
//
import { UploadProps } from '../types';

// ----------------------------------------------------------------------

function MultiFilePreview({ thumbnail, files, onRemove, sx }: UploadProps) {
	if (!files?.length) {
		return null;
	}

	return (
		<AnimatePresence initial={false}>
			{files.map((file) => {
				const { path = '', size = 0 } = fileData(file.file);

				const isNotFormatFile = typeof file === 'string';

				if (thumbnail) {
					return (
						<Stack
							key={file.preview}
							component={m.div}
							{...varFade().in}
							alignItems="center"
							display="inline-flex"
							justifyContent="center"
							sx={{
								m: 0.5,
								width: 80,
								height: 80,
								borderRadius: 1.25,
								overflow: 'hidden',
								position: 'relative',
								border: (theme) => `solid 1px ${theme.palette.divider}`,
								...sx,
							}}
						>
							<FileThumbnail
								tooltip
								imageView
								file={file.file}
								sx={{ position: 'absolute' }}
								imgSx={{ position: 'absolute' }}
							/>

							{onRemove && (
								<IconButton
									size="small"
									onClick={() => onRemove(file.file)}
									sx={{
										top: 4,
										right: 4,
										p: '1px',
										position: 'absolute',
										color: (theme) => alpha(theme.palette.common.white, 0.72),
										bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
										'&:hover': {
											bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
										},
									}}
								>
									<Iconify icon="eva:close-fill" width={16} />
								</IconButton>
							)}
						</Stack>
					);
				}

				return (
					<Stack
						key={file.id}
						component={m.div}
						{...varFade().in}
						spacing={2}
						direction="row"
						alignItems="center"
						sx={{
							my: 1,
							px: 1,
							py: 0.75,
							borderRadius: 0.75,
							border: (theme) => `solid 1px ${theme.palette.divider}`,
							...sx,
						}}
					>
						<FileThumbnail file={file.file} />

						<Stack flexGrow={1} sx={{ minWidth: 0 }}>
							<Typography variant="subtitle2" noWrap>
								{isNotFormatFile ? file : path}
							</Typography>

							<Typography
								variant="caption"
								sx={{ color: 'text.secondary', display: 'flex', justifyContent: 'space-between' }}
							>
								{isNotFormatFile ? '' : fData(size)}
								<span>{file.progress === 100 ? 'Completed' : `${file.progress}%`}</span>
							</Typography>

							{file.progress !== 100 && (
								<LinearProgress
									color={file.progress === 0 ? 'warning' : 'primary'}
									variant="determinate"
									value={file.progress || 0}
								/>
							)}
						</Stack>

						{onRemove && (
							<IconButton edge="end" size="small" onClick={() => onRemove(file.file)}>
								<Iconify icon="eva:close-fill" />
							</IconButton>
						)}
					</Stack>
				);
			})}
		</AnimatePresence>
	);
}

export default memo(MultiFilePreview);
