import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { useUser } from '../lib/useUser';

import Input from '../components/forms/Input';
import Button from '../components/forms/Button';

import styles from '../styles/Setting.module.css';
import { GET_FROM_API } from '../helpers/utils';

const SettingPage = () => {
	const { user, updateUser } = useUser();
	const [fullUser, setFullUser] = useState(user);

	useEffect(() => {
		(async () => {
			const user = await GET_FROM_API(`/user/me?populate=autobidItems`);
			setFullUser(user);
		})();
	}, [user]);

	if (!user) {
		return '';
	}

	const handleSubmitForm = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const newUserConfig = {
			alertPercent: parseInt(form.alert.value),
			autobidBudget: parseInt(form.budget.value),
		};
		try {
			await updateUser(newUserConfig);
			alert('Saved');
		} catch (error) {
			alert(error.message);
		}
	};

	const handleChangeBudget = (e) => {
		const budget = parseInt(e.currentTarget.value);
		if (isNaN(budget) || budget <= 0) {
			return e.currentTarget.setCustomValidity('Not a valid budget');
		}
		if (budget > 100000000000) {
			return e.currentTarget.setCustomValidity(
				'Your budgeti is too high'
			);
		}
		e.currentTarget.setCustomValidity('');
	};

	const handleChangeAlertPercent = (e) => {
		const alertPercent = parseInt(e.currentTarget.value);
		if (isNaN(alertPercent) || alertPercent <= 0 || alertPercent > 100) {
			return e.currentTarget.setCustomValidity('Not a valid percentage');
		}
		e.currentTarget.setCustomValidity('');
	};

	const items = fullUser.autobidItems || [];

	return (
		<div className={styles.setting} key={user}>
			<h1 className={styles.title}>Bidding Settings</h1>
			<form className={styles.form} onSubmit={handleSubmitForm}>
				<label className={styles.label}>Auto-bidding Budget</label>
				<Input
					type="tel"
					name="budget"
					defaultValue={user.autobidBudget}
					onChange={handleChangeBudget}
				/>
				<label className={styles.label}>
					Alert Notification Percentage
				</label>
				<Input
					type="tel"
					name="alert"
					defaultValue={user.alertPercent}
					onChange={handleChangeAlertPercent}
				/>
				<Button text="Save" type="primary" />
			</form>
			<div className={styles.autobid}>
				<h2>Current Auto-bidding Items</h2>
				<table className={styles.table}>
					<colgroup>
						<col style={{ width: '40%' }} />
						<col style={{ width: '30%' }} />
						<col style={{ width: '30%' }} />
					</colgroup>
					<thead>
						<tr>
							<th>Name</th>
							<th className={styles.right}>
								Current Highest Bid
							</th>
							<th className={styles.right}>Bidden By</th>
						</tr>
					</thead>
					<tbody>
						{items.map((item) => {
							const highestBid = item.highestBid;
							let amount = '---';
							let by = '---';
							if (highestBid) {
								amount = `${highestBid.amount.toLocaleString()} USD`;
								by = `${highestBid.user.firstName}${
									highestBid.user.username === user.username
										? ' (You)'
										: ''
								}`;
							}

							return (
								<tr key={item._id}>
									<td>
										<Link href={`/item/${item.slug}`}>
											<span className={styles.link}>
												{item.name}
											</span>
										</Link>
									</td>
									<td className={styles.right}>{amount}</td>
									<td className={styles.right}>{by}</td>
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
