/* eslint-disable react/prop-types */
import React from 'react';
import Head from 'next/head';

import '../styles/globals.css';

import Layout from '../components/Layout';
import { UserProvider } from '../lib/useUser';

function MyApp({ Component, pageProps }) {
	return (
		<UserProvider>
			<Layout>
				<Head>
					<title>Scopic Auction</title>
					<meta
						name="description"
						content="Best auction collections in the world"
					/>
				</Head>
				<Component {...pageProps} />
			</Layout>
		</UserProvider>
	);
}

export default MyApp;
