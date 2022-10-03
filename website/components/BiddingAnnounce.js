import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles/BiddingAnnounce.module.css';

const BiddingAnnounce = (props) => {
	const { highestBid, ended, user } = props;

	return (
		<>
			{highestBid && ended ? (
				<>
					<div className={styles.currentLabel}>
						The winner is{' '}
						{highestBid.user
							? `${highestBid.user.firstName} ${highestBid.user.lastName}`
							: 'N/A'}
						{user && user.username === highestBid.user.username
							? ` (You)`
							: ''}
					</div>
					<div className={styles.currentLabel}>
						with the highest bid at
					</div>
					<div className={styles.currentPrice}>
						{highestBid.amount.toLocaleString()} USD
					</div>
				</>
			) : (
				''
			)}
			{highestBid && !ended ? (
				<>
					<div className={styles.currentLabel}>
						Current highest bid
					</div>
					<div className={styles.currentPrice}>
						{highestBid.amount.toLocaleString()} USD
					</div>
					<div className={styles.currentLabel}>
						by{' '}
						{highestBid.user
							? `${highestBid.user.firstName} ${highestBid.user.lastName}`
							: 'N/A'}
						{user && user.username === highestBid.user.username
							? ` (You)`
							: ''}
					</div>
				</>
			) : (
				''
			)}
		</>
	);
};

BiddingAnnounce.propTypes = {
	highestBid: PropTypes.object.isRequired,
	ended: PropTypes.bool.isRequired,
	user: PropTypes.object.isRequired,
};

export default BiddingAnnounce;
