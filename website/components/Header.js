import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { UserContext } from '../contexts';

import Dropdown from './forms/Dropdown';

import styles from '../styles/Header.module.css';

const Header = () => {
	const { showLoginForm, logout, user } = useContext(UserContext);
	const router = useRouter();

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
					<Dropdown
						options={[
							{
								text: 'Bid Settings',
								handler: () => {
									router.push('/setting');
								},
							},
							{
								text: 'Logout',
								handler: logout,
							},
						]}
					>
						<span>{user.username}</span>
					</Dropdown>
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
