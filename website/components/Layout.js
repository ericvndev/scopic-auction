import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import styles from '../styles/Layout.module.css';

import Header from './Header';
import Footer from './Footer';

import { useUser } from '../lib/useUser';

const Layout = (props) => {
	const { user } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (!user && router.pathname !== '/login') {
			router.push('/login');
		}
	}, [user, router]);

	if (!user && (!router || router.pathname !== '/login')) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<Header />
			<main className={styles.main}>{props.children}</main>
			<Footer />
		</div>
	);
};

Layout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Layout;
