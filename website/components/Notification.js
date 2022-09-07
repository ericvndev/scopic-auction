import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import styles from '../styles/Notification.module.css';
import Dropdown from './forms/Dropdown';

const Notification = (props) => {
	const { notifications } = props;
	const [notificationsWithNew, setNotificationsWithNew] = useState([]);
	const router = useRouter();

	useEffect(() => {
		let lastCheck = localStorage.getItem('last-check') || 0;
		if (lastCheck) {
			lastCheck = new Date(lastCheck);
		}
		const notificationsWithNew = notifications.map((noti) =>
			new Date(noti.createdAt) > lastCheck ? { ...noti, new: true } : noti
		);
		setNotificationsWithNew(notificationsWithNew);
	}, [notifications]);

	const handleCloseNoti = () => {
		localStorage.setItem('last-check', new Date().toISOString());
		setNotificationsWithNew(notifications);
	};

	const newNotiCount = notificationsWithNew.filter((noti) => noti.new).length;

	return (
		<div className={styles.notification}>
			<Dropdown
				options={notificationsWithNew.map((noti) => ({
					highlight: noti.new,
					text: noti.content,
					handler: () => router.push('/setting'),
				}))}
				onClose={handleCloseNoti}
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
