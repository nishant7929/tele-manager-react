import { Helmet } from 'react-helmet-async';
// @mui
import { Typography } from '@mui/material';
// components
import Iconify from '../../components/iconify';
// sections
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeForm';
import { SetStateAction } from 'react';

// ----------------------------------------------------------------------
interface Props {
	phoneNumber: string;
	setPhoneNumber: React.Dispatch<SetStateAction<string>>;
}

export default function VerifyCodePage({ phoneNumber, setPhoneNumber }: Props) {
	return (
		<>
			<Helmet>
				<title> Verify Code | Tele Manager</title>
			</Helmet>

			<Typography variant="h3" paragraph>
				Please check your telegram app!
			</Typography>

			<Typography sx={{ color: 'text.secondary', mb: 5 }}>
				You will receive a 5-digit verification code to your telegram account.
			</Typography>

			<AuthVerifyCodeForm phoneNumber={phoneNumber} />

			<Typography variant="body2" sx={{ my: 2 }}>
				{/* Don’t have a code? &nbsp;
				<Link variant="subtitle2">Resend code</Link> */}
			</Typography>

			<Typography
				onClick={() => setPhoneNumber('')}
				color="inherit"
				variant="subtitle2"
				sx={{
					mx: 'auto',
					alignItems: 'center',
					display: 'inline-flex',
					cursor: 'pointer',
				}}
			>
				<Iconify icon="eva:chevron-left-fill" width={16} />
				Return to sign in
			</Typography>
		</>
	);
}
