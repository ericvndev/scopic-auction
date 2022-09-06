import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Modal from './Modal';
import Input from './forms/Input';
import Button from './forms/Button';

import { formatDateISO, POST_TO_API } from '../helpers/utils';

import styles from '../styles/UpsertItem.module.css';

const UpsertItem = (props) => {
	const { item, onClose, onUpdated } = props;
	const handleCloseModal = () => {
		onClose();
	};
	const upsertItem = useCallback(async (newItem) => {
		if (newItem._id) {
			const updatedItem = await POST_TO_API(
				`/item/${newItem._id}`,
				newItem,
				'PATCH'
			);
			console.log(updatedItem);
			onUpdated();
		} else {
			const createdItem = await POST_TO_API('/item', newItem);
			console.log(createdItem);
			onUpdated();
		}
	}, []);

	const handleSaveItem = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const newItem = {
			_id: item._id,
			name: form.name.value,
			description: form.description.value,
			basePrice: parseInt(form.basePrice.value),
			startDateTime: new Date(form.startDateTime.value),
			closeDateTime: new Date(form.closeDateTime.value),
		};
		await upsertItem(newItem);
	};

	if (!item) {
		return '';
	}

	return (
		<Modal show onClose={handleCloseModal}>
			<div className={styles.upsertItem}>
				<h2 className={styles.title}>
					{item ? 'Update Item' : 'Create Item'}
				</h2>
				<form className={styles.form} onSubmit={handleSaveItem}>
					<label>Name</label>
					<Input
						placeholder="Item name"
						name="name"
						defaultValue={item.name}
					/>
					<label>Description</label>
					<Input
						placeholder="Item description"
						name="description"
						multiline
						defaultValue={item.description}
					/>
					<label>Base Price</label>
					<Input
						placeholder="1000000"
						name="basePrice"
						defaultValue={item.basePrice}
					/>
					<label>Start Date</label>
					<Input
						type="datetime-local"
						name="startDateTime"
						defaultValue={formatDateISO(item.startDateTime)}
					/>
					<label>End Date</label>
					<Input
						type="datetime-local"
						name="closeDateTime"
						defaultValue={formatDateISO(item.closeDateTime)}
					/>
					<Button text="Save" type="primary" />
				</form>
			</div>
		</Modal>
	);
};

UpsertItem.propTypes = {
	item: PropTypes.object,
	onClose: PropTypes.func,
	onUpdated: PropTypes.func,
};

UpsertItem.defaultProps = {
	item: null,
	onClose: () => {},
	onUpdated: () => {},
};

export default UpsertItem;
