import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { UserContext } from '../contexts';

import styles from '../styles/Header.module.css';

const Header = () => {
	const { showLoginForm, user } = useContext(UserContext);

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
				{user ? (
					<span>{user.username}</span>
				) : (
					<span onClick={showLoginForm} className={styles.login}>
						Login
					</span>
				)}
			</div>
		</header>
	);
};

Header.propTypes = {};

export default Header;
