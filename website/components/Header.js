import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import Image from 'next/image';

import styles from '../styles/Header.module.css';

const Header = (props) => {
	return (
		<header className={styles.header}>
			<Link href="/">
				<div className={styles.left}>
					<Image
						className={styles.logo}
						src="/images/scopic-logo-only-white.png"
						width={40}
						height={40}
						alt="Scopic Logo"
					/>
					<span className={styles.name}>Scopic Auction</span>
				</div>
			</Link>
			<div className={styles.right}>
				<span>Login</span>
			</div>
		</header>
	);
};

Header.propTypes = {};

export default Header;
