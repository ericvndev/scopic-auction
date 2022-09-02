import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles/Layout.module.css';

import Header from './Header';
import Footer from './Footer';

const Layout = (props) => {
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
