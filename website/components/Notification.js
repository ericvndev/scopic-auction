import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import styles from '../styles/Notification.module.css';
import Dropdown from './forms/Dropdown';

const Notification = (props) => {
	const { notifications } = props;
	const [newNotiCount, setNewNotiCount] = useState(30);
	const router = useRouter();

	useEffect(() => {
		let lastCheck = localStorage.getItem('last-check') || 0;
		if (lastCheck) {
			lastCheck = new Date(lastCheck);
		}
		const countNewNofi = notifications.filter(
			(noti) => new Date(noti.createdAt) > lastCheck
		).length;
		setNewNotiCount(countNewNofi);
	}, [notifications]);

	const handleShowNoti = () => {
		localStorage.setItem('last-check', new Date().toISOString());
		setNewNotiCount(0);
	};

	return (
		<div className={styles.notification}>
			<Dropdown
				options={notifications.map((noti) => ({
					text: noti.content,
					handler: () => router.push('/setting'),
				}))}
				onShow={handleShowNoti}
			>
				<div className={styles.iconWrapper}>
					<span className={styles.icon}>✉</span>
					<span className={styles.count}>{newNotiCount}</span>
				</div>
			</Dropdown>
		</div>
	);
};

Notification.propTypes = {
	notifications: PropTypes.array,
};

Notification.defaultProps = {
	notifications: [],
};

export default Notification;
