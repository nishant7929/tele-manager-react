import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
// sections
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeForm';

// ----------------------------------------------------------------------

export default function VerifyCodePage({ phoneNumber }: { phoneNumber: string }) {
	return (
		<>
			<Helmet>
				<title> Verify Code | Zcloud</title>
			</Helmet>

			<Typography variant="h3" paragraph>
				Please check your telegram app!
			</Typography>

			<Typography sx={{ color: 'text.secondary', mb: 5 }}>
				You will receive a 5-digit verification code to your telegram account or in phone number.
			</Typography>

			<AuthVerifyCodeForm phoneNumber={phoneNumber} />

			<Typography variant="body2" sx={{ my: 3 }}>
				Don’t have a code? &nbsp;
				<Link variant="subtitle2">Resend code</Link>
			</Typography>

			<Link
				component={RouterLink}
				to={PATH_AUTH.login}
				color="inherit"
				variant="subtitle2"
				sx={{
					mx: 'auto',
					alignItems: 'center',
					display: 'inline-flex',
				}}
			>
				<Iconify icon="eva:chevron-left-fill" width={16} />
				Return to sign in
			</Link>
		</>
	);
}
