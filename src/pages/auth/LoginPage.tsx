import { Helmet } from 'react-helmet-async';
// @mui
import { Typography } from '@mui/material';
// sections
import AuthLoginForm from '../../sections/auth/AuthLoginForm';
import { useState } from 'react';
import VerifyCodePage from './VerifyCodePage';

// ----------------------------------------------------------------------

export default function LoginPage() {
	const [phoneNumber, setPhoneNumber] = useState('');

	const renderLogin = () => (
		<>
			<Helmet>
				<title> Sign in | Zcloud</title>
			</Helmet>

			<Typography variant="h3" paragraph>
				Sign in to Zcloud
			</Typography>

			<AuthLoginForm handleCodeSend={(phoneNumber: string) => setPhoneNumber(phoneNumber)} />
		</>
	);

	return (
		<>
			{
				!Boolean(phoneNumber)
					? renderLogin()
					: <VerifyCodePage
						phoneNumber={phoneNumber}
						setPhoneNumber={setPhoneNumber}
					/>
			}
		</>
	);
}
