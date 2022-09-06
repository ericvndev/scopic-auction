import React, { useContext } from 'react';

import { UserContext } from '../contexts';

import Input from '../components/forms/Input';
import Button from '../components/forms/Button';

import styles from '../styles/Setting.module.css';

const SettingPage = () => {
	const { user, update: updateUser } = useContext(UserContext);

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

	return (
		<div className={styles.setting} key={user}>
			<h1 className={styles.title}>Bidding Settings</h1>
			<form className={styles.form} onSubmit={handleSubmitForm}>
				<label className={styles.label}>Auto-bidding Budget</label>
				<Input
					type="tel"
					name="budget"
					defaultValue={user.autobidBudget}
				/>
				<label className={styles.label}>
					Alert Notification Percentage
				</label>
				<Input
					type="tel"
					name="alert"
					defaultValue={user.alertPercent}
				/>
				<Button text="Save" type="primary" />
			</form>
		</div>
	);
};

export default SettingPage;
