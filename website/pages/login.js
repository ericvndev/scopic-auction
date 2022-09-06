import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import Input from '../components/forms/Input';
import Button from '../components/forms/Button';

import styles from '../styles/Login.module.css';
import { useUser } from '../lib/useUser';

const LoginPage = () => {
	const { login, user } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (user && user.isLoggedIn) {
			router.push('/');
		}
	}, [user]);

	const handleLoginFormSubmit = async (e) => {
		e.preventDefault();
		const form = e.target;
		const { username, password } = form;
		await login(username.value, password.value);
	};

	return (
		<div className={styles.login}>
			<h1 className={styles.title}>Scopic Auction</h1>
			<form className={styles.form} onSubmit={handleLoginFormSubmit}>
				<Input
					type="text"
					placeholder="Username"
					name="username"
					isFull
				/>
				<Input
					type="password"
					placeholder="Password"
					name="password"
					isFull
				/>
				<Button type="primary" text="Login" />
			</form>
		</div>
	);
};

LoginPage.propTypes = {};

export default LoginPage;
