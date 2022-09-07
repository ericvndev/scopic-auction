import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

import { GET_FROM_API } from '../helpers/utils';

import { useUser } from '../lib/useUser';
import Dropdown from './forms/Dropdown';
import Notification from './Notification';

import styles from '../styles/Header.module.css';

const Header = () => {
	const { logout, user, refetchUser } = useUser();
	const router = useRouter();
	const [notifications, setNotifications] = useState();

	const fetchNoti = useCallback(async () => {
		try {
			const notifications = await GET_FROM_API('/notifications');
			setNotifications(notifications);
		} catch (error) {
			console.log(error);
		}
	}, []);

	useEffect(() => {
		if (user && user.isLoggedIn) {
			const socket = io(
				`${process.env.NEXT_PUBLIC_API_HOST}?item=${user.username}`
			);
			socket.on('refetch-noti', () => {
				fetchNoti();
				refetchUser();
			});
			fetchNoti();
			return () => {
				socket.disconnect();
				socket.close();
			};
		}
	}, [user]);

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
				{user ? <Notification notifications={notifications} /> : ''}
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
					''
				)}
			</div>
		</header>
	);
};

Header.propTypes = {};

export default Header;
