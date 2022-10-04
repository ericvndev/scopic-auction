import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { useUser } from '../lib/useUser';

import styles from '../styles/Setting.module.css';
import { GET_FROM_API, formatDate } from '../helpers/utils';

const SettingPage = () => {
	const { user } = useUser();
	const [fullUser, setFullUser] = useState(user);

	useEffect(() => {
		(async () => {
			try {
				const user = await GET_FROM_API(
					`/user/me?populate=bidItems,bills`
				);
				setFullUser(user);
			} catch (error) {
				console.log(error.message);
			}
		})();
	}, []);

	if (!user) {
		return '';
	}

	const { bidItems = [], bills = [] } = fullUser;

	const calculatedBidItems = bidItems.map((item) => {
		const highestBid = item.highestBid;
		item.price = '---';
		let isHighest = false;
		item.ended = false;
		if (highestBid) {
			item.price = `${highestBid.amount.toLocaleString()} USD`;
			isHighest = highestBid.user === user.username;
		}
		if (new Date(item.closeDateTime) < new Date()) {
			item.ended = true;
		}
		item.state = !item.ended ? 'In progress' : '';
		if (!item.state) {
			item.state = isHighest ? 'Won' : 'Lost';
		}
		return item;
	});

	calculatedBidItems.sort((item1) =>
		item1.state === 'In progress' ? -1 : 0
	);

	return (
		<div className={styles.setting} key={user}>
			<div className={styles.autobid}>
				<h2>Bid Items</h2>
				<table className={styles.table}>
					<colgroup>
						<col style={{ width: '40%' }} />
						<col style={{ width: '20%' }} />
						<col style={{ width: '20%' }} />
						<col style={{ width: '20%' }} />
					</colgroup>
					<thead>
						<tr>
							<th>Name</th>
							<th className={styles.right}>Highest Price</th>
							<th className={styles.right}>State</th>
							<th className={styles.right}>Ended At</th>
						</tr>
					</thead>
					<tbody>
						{calculatedBidItems.map((item) => {
							return (
								<tr key={item._id}>
									<td>
										<Link href={`/item/${item.slug}`}>
											<span className={styles.link}>
												{item.name}
											</span>
										</Link>
									</td>
									<td className={styles.right}>
										{item.price}
									</td>
									<td className={styles.right}>
										{item.state}
									</td>
									<td className={styles.right}>
										{formatDate(item.closeDateTime)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<div className={styles.budgetLeft}></div>
			</div>
			<div className={styles.autobid}>
				<h2>Won Items</h2>
				<table className={styles.table}>
					<colgroup>
						<col style={{ width: '40%' }} />
						<col style={{ width: '30%' }} />
						<col style={{ width: '30%' }} />
					</colgroup>
					<thead>
						<tr>
							<th>Name</th>
							<th className={styles.right}>Price</th>
							<th className={styles.right}>Won at</th>
						</tr>
					</thead>
					<tbody>
						{calculatedBidItems
							.filter(
								(item) =>
									item.highestBid &&
									item.highestBid.user === user.username &&
									item.ended
							)
							.map((item) => {
								return (
									<tr key={item._id}>
										<td>
											<Link href={`/item/${item.slug}`}>
												<span className={styles.link}>
													{item.name}
												</span>
											</Link>
										</td>
										<td className={styles.right}>
											{item.price}
										</td>
										<td className={styles.right}>
											{formatDate(item.closeDateTime)}
										</td>
									</tr>
								);
							})}
					</tbody>
				</table>
				<div className={styles.budgetLeft}></div>
			</div>
			<div className={styles.autobid}>
				<h2>Bills</h2>
				<table className={styles.table}>
					<colgroup>
						<col style={{ width: '40%' }} />
						<col style={{ width: '30%' }} />
						<col style={{ width: '30%' }} />
					</colgroup>
					<thead>
						<tr>
							<th>Name</th>
							<th className={styles.right}>Price</th>
							<th className={styles.right}>Issue Date</th>
						</tr>
					</thead>
					<tbody>
						{bills.map((bill) => {
							const item = bidItems.find(
								(item) => item._id === bill.itemId
							);
							console.log(item);
							const highestBid = item.highestBid;
							let amount = '---';
							if (highestBid) {
								amount = `${highestBid.amount.toLocaleString()} USD`;
							}

							return (
								<tr key={item._id}>
									<td>
										<span>{item.name}</span>
									</td>
									<td className={styles.right}>{amount}</td>
									<td className={styles.right}>
										{formatDate(bill.issueDate)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<div className={styles.budgetLeft}></div>
			</div>
		</div>
	);
};

export default SettingPage;
