import React, { useContext, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';

import { UserContext } from '../contexts';

import Checkbox from '../components/forms/Checkbox';
import Input from '../components/forms/Input';

import styles from '../styles/Setting.module.css';

const SettingPage = () => {
	const { user } = useContext(UserContext);
	const [settings, setSettings] = useState([]);
	const [editingIndex, setEditingIndex] = useState(-1);
	const [editingInfo, setEditingInfo] = useState({});

	const fetchBidSettings = useCallback(async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_HOST}/v1/bid-settings`,
				{
					headers: {
						Authorization: `JWT ${user.token}`,
					},
				}
			);
			const { error, data } = await res.json();
			if (error) {
				throw new Error(error);
			}
			setSettings(data);
		} catch (error) {
			console.log(error);
			alert(
				'There was an error fetching the bidding settings. Please try again later.'
			);
		}
	}, [user]);

	const updateSetting = useCallback(
		async (newSetting) => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_HOST}/v1/bid-setting`,
					{
						method: 'PUT',
						headers: {
							'content-type': 'application/json',
							Authorization: `JWT ${user.token}`,
						},
						body: JSON.stringify(newSetting),
					}
				);
				const { error, data } = await res.json();
				if (error) {
					throw new Error(error);
				}
				return data;
			} catch (error) {
				fetchBidSettings();
				alert(error);
				return null;
			}
		},
		[user]
	);

	useEffect(() => {
		if (user) {
			fetchBidSettings();
		}
	}, [user]);

	const handleChangeSetting = (prop, newValue) => {
		const newEditingInfo = {
			...editingInfo,
			[prop]: newValue,
		};
		setEditingInfo(newEditingInfo);
	};

	const handleEditClick = (index) => {
		const setting = { ...settings[index] };
		setEditingInfo(setting);
		setEditingIndex(index);
	};

	const handleUpdateSetting = async () => {
		const newSetting = {
			_id: editingInfo._id,
			maximumAutoBidAmount: editingInfo.maximumAutoBidAmount,
			enableAutoBid: editingInfo.enableAutoBid,
			alertPercent: parseInt(editingInfo.alertPercent),
		};
		const newSettings = [...settings];
		newSettings[editingIndex] = {
			...newSettings[editingIndex],
			...newSetting,
		};
		setSettings(newSettings);
		setEditingIndex(-1);
		await updateSetting(newSetting);
	};

	return (
		<div className={styles.setting}>
			<h1 className={styles.title}>Bidding Settings</h1>
			<table className={styles.table}>
				<colgroup>
					<col style={{ width: '38%' }} />
					<col style={{ width: '12%' }} />
					<col style={{ width: '20%' }} />
					<col style={{ width: '15%' }} />
					<col style={{ width: '10%' }} />
				</colgroup>
				<thead>
					<tr>
						<th>Item</th>
						<th className={styles.center}>Enabled Autobid</th>
						<th className={styles.right}>Maximum Amount</th>
						<th className={styles.right}>Alert Percentage</th>
						<th className={styles.right}>Action</th>
					</tr>
				</thead>
				<tbody>
					{settings.map((setting, index) => {
						const isEditing = editingIndex === index;

						return (
							<tr key={setting.itemId._id}>
								<td>
									<Link href={`/item/${setting.itemId.slug}`}>
										<span className={styles.link}>
											{setting.itemId.name}
										</span>
									</Link>
								</td>
								<td className={styles.center}>
									{isEditing ? (
										<Checkbox
											id={`autobid`}
											checked={editingInfo.enableAutoBid}
											onChange={(e) =>
												handleChangeSetting(
													'enableAutoBid',
													!!e.target.checked
												)
											}
										/>
									) : (
										<span>
											{setting.enableAutoBid
												? 'ON'
												: 'OFF'}
										</span>
									)}
								</td>
								<td className={styles.right}>
									<div className={styles.inputGroup}>
										{isEditing ? (
											<Input
												value={
													editingInfo.maximumAutoBidAmount
												}
												onChange={(e) =>
													handleChangeSetting(
														'maximumAutoBidAmount',
														e.target.value
													)
												}
												className={styles.input}
											/>
										) : (
											<span>
												{setting.maximumAutoBidAmount.toLocaleString()}{' '}
												USD
											</span>
										)}
									</div>
								</td>
								<td className={styles.right}>
									<div className={styles.inputGroup}>
										{isEditing ? (
											<Input
												value={editingInfo.alertPercent}
												onChange={(e) =>
													handleChangeSetting(
														'alertPercent',
														e.target.value
													)
												}
												className={`${styles.input} ${styles.inputShort}`}
											/>
										) : (
											<span>
												{setting.alertPercent} %
											</span>
										)}
									</div>
								</td>
								<td
									className={`${styles.right} ${styles.action}`}
									onClick={
										isEditing
											? handleUpdateSetting
											: () => handleEditClick(index)
									}
								>
									{isEditing ? 'Save' : 'Edit'}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default SettingPage;
