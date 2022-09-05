import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles/BiddingHistory.module.css';

const BiddingHistory = (props) => {
	const { bids } = props;
	const sortedBid = [...bids].sort((a, b) => b.amount - a.amount);

	return (
		<table className={styles.table}>
			<colgroup>
				<col style={{ width: '20%' }} />
				<col style={{ width: '10%' }} />
				<col style={{ width: '70%' }} />
			</colgroup>
			<thead>
				<tr>
					<th>Bid At</th>
					<th>By User</th>
					<th className={styles.right}>Amount</th>
				</tr>
			</thead>
			<tbody>
				{sortedBid.map((bid) => {
					const user = bid.user || { firstName: 'N/A' };
					const createdAt = new Date(bid.createdAt);

					return (
						<tr key={bid.amount}>
							<td>
								{`0${createdAt.getDate()}`.slice(-2)}/
								{`0${createdAt.getMonth() + 1}`.slice(-2)}/
								{createdAt.getFullYear()} -{' '}
								{`0${createdAt.getHours()}`.slice(-2)}:
								{`0${createdAt.getMinutes()}`.slice(-2)}
							</td>
							<td>
								{user.firstName} {user.lastName}
							</td>
							<td className={styles.right}>
								{bid.amount.toLocaleString()}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

BiddingHistory.propTypes = {
	bids: PropTypes.array,
};

BiddingHistory.defaultProps = {
	bids: [],
};

export default BiddingHistory;
