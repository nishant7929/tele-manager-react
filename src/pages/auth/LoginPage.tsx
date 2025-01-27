import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import { Typography } from '@mui/material';
// sections
import AuthLoginForm from '../../sections/auth/AuthLoginForm';
import VerifyCodePage from './VerifyCodePage';

// ----------------------------------------------------------------------

export default function LoginPage() {
	const [phoneNumber, setPhoneNumber] = useState('');

	const renderLogin = () => (
		<>
			<Helmet>
				<title> Sign in | Tele Cloud</title>
			</Helmet>

			<Typography variant="h3" paragraph>
				Sign in to Tele Cloud
			</Typography>

			<AuthLoginForm handleCodeSend={(phoneNumber: string) => setPhoneNumber(phoneNumber)} />
		</>
	);

	return (
		<>
			{!phoneNumber ? (
				renderLogin()
			) : (
				<VerifyCodePage phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} />
			)}
		</>
	);
}
