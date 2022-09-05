/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import '../styles/globals.css';

import { UserContext } from '../contexts';

import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Input from '../components/forms/Input';
import Button from '../components/forms/Button';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
	const [user, setUser] = useState(null);
	const router = useRouter();
	const [showLogin, setShowLogin] = useState(false);

	useEffect(() => {
		if (localStorage) {
			const token = localStorage.getItem('token');
			if (token) {
				(async () => {
					const res = await fetch(
						`${process.env.NEXT_PUBLIC_API_HOST}/v1/user/me`,
						{ headers: { Authorization: 'JWT ' + token } }
					);
					const userData = await res.json();
					if (
						userData &&
						!userData.error &&
						userData.data &&
						userData.data.username
					) {
						setUser({
							...userData.data,
							token: token,
						});
					}
				})();
			}
		}
	}, []);

	const handleCloseModal = () => {
		setShowLogin(false);
	};

	const handleLoginFormSubmit = async (e) => {
		e.preventDefault();
		const form = e.target;
		const { username, password } = form;
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_HOST}/v1/user/login`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: username.value,
						password: password.value,
					}),
				}
			);
			const loginInfo = await response.json();
			if (loginInfo.error) {
				throw new Error(loginInfo.error);
			}

			localStorage.setItem('token', loginInfo.accessToken);
			router.reload();
		} catch (error) {
			alert(error.message);
		}
	};

	const handleLogout = async () => {
		if (!user) {
			return;
		}
		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/user/logout`, {
				method: 'POST',
				headers: {
					Authorization: 'JWT ' + user.token,
				},
			});
			localStorage.removeItem('token');
			router.reload();
		} catch (error) {
			alert(error.message);
		}
	};

	return (
		<UserContext.Provider
			value={{
				user,
				showLoginForm: () => setShowLogin(true),
				logout: handleLogout,
			}}
		>
			<Layout>
				<Head>
					<title>Scopic Auction</title>
					<meta
						name="description"
						content="Best auction collections in the world"
					/>
				</Head>
				<Component {...pageProps} />
				<Modal show={showLogin} onClose={handleCloseModal}>
					<div>
						<form onSubmit={handleLoginFormSubmit}>
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
				</Modal>
			</Layout>
		</UserContext.Provider>
	);
}

export default MyApp;
