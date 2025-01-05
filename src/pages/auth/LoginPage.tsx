import { Helmet } from 'react-helmet-async';
// @mui
import { Typography } from '@mui/material';
// sections
import AuthResetPasswordForm from '../../sections/auth/AuthResetPasswordForm';

// ----------------------------------------------------------------------

export default function LoginPage() {
	return (
		<>
			<Helmet>
				<title> Sign in | Zcloud</title>
			</Helmet>

			<Typography variant="h3" paragraph>
				Sign in to Zcloud
			</Typography>

			{/* <Typography sx={{ color: 'text.secondary', mb: 5 }}>
				Please enter the email address associated with your account and We will email you a link to
				reset your password.
			</Typography> */}

			<AuthResetPasswordForm />

			{/* <Link
				component={RouterLink}
				to={PATH_AUTH.login}
				color="inherit"
				variant="subtitle2"
				sx={{
					mt: 3,
					mx: 'auto',
					alignItems: 'center',
					display: 'inline-flex',
				}}
			>
				<Iconify icon="eva:chevron-left-fill" width={16} />
				Return to sign in
			</Link> */}
		</>
	);
}
