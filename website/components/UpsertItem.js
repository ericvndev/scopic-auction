import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Modal from './Modal';
import Input from './forms/Input';
import Button from './forms/Button';
import FileInput from './forms/FileInput';

import { formatDateISO, POST_FORM_DATA_TO_API } from '../helpers/utils';

import styles from '../styles/UpsertItem.module.css';

const UpsertItem = (props) => {
	const { item, onClose, onUpdated } = props;
	const handleCloseModal = () => {
		onClose();
	};
	const upsertItem = useCallback(async (newItem) => {
		try {
			if (newItem._id) {
				await POST_FORM_DATA_TO_API(
					`/item/${newItem._id}`,
					newItem,
					'PATCH'
				);
				onUpdated();
			} else {
				await POST_FORM_DATA_TO_API('/item', newItem);
				onUpdated();
			}
		} catch (error) {
			alert(error.message);
		}
	}, []);

	const handleChangeBasePrice = (e) => {
		const basePrice = parseInt(e.currentTarget.value);
		if (isNaN(basePrice) || basePrice < 0) {
			e.currentTarget.setCustomValidity('Not a valid price');
		} else {
			e.currentTarget.setCustomValidity('');
		}
	};

	const handleChangeStartDateTime = (e) => {
		const startDateTime = new Date(e.currentTarget.value);
		const form = e.currentTarget.form;
		const closeDateTime = form.closeDateTime.value;
		if (closeDateTime && new Date(closeDateTime) < startDateTime) {
			e.currentTarget.setCustomValidity(
				'Start date time must be before close date time'
			);
		} else {
			e.currentTarget.setCustomValidity('');
		}
	};

	const handleChangeCloseDateTime = (e) => {
		const closeDateTime = new Date(e.currentTarget.value);
		const form = e.currentTarget.form;
		const startDateTime = form.startDateTime.value;
		if (startDateTime && new Date(startDateTime) > closeDateTime) {
			e.currentTarget.setCustomValidity(
				'Close date time must be after start date time'
			);
		} else {
			e.currentTarget.setCustomValidity('');
		}
	};

	const handleSaveItem = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const newItem = {
			name: form.name.value,
			description: form.description.value,
			basePrice: parseInt(form.basePrice.value),
			image: form.image.files[0],
			startDateTime: new Date(form.startDateTime.value),
			closeDateTime: new Date(form.closeDateTime.value),
		};
		if (item._id) {
			newItem._id = item._id;
		}
		await upsertItem(newItem);
	};

	if (!item) {
		return '';
	}

	return (
		<Modal show onClose={handleCloseModal}>
			<div className={styles.upsertItem}>
				<h2 className={styles.title}>
					{item._id ? 'Update Item' : 'Create Item'}
				</h2>
				<form className={styles.form} onSubmit={handleSaveItem}>
					<div className={styles.left}>
						<FileInput
							id="item-image"
							name="image"
							defaultValue={
								item.images
									? `${process.env.NEXT_PUBLIC_API_HOST}${item.images[0]}`
									: undefined
							}
							required
						/>
					</div>
					<div className={styles.right}>
						<label>Name</label>
						<Input
							required
							placeholder="Item name"
							name="name"
							defaultValue={item.name}
						/>
						<label>Description</label>
						<Input
							required
							placeholder="Item description"
							name="description"
							multiline
							defaultValue={item.description}
						/>
						<label>Base Price</label>
						<Input
							required
							placeholder="1000000"
							name="basePrice"
							onChange={handleChangeBasePrice}
							defaultValue={item.basePrice}
						/>
						<label>Start Date Time</label>
						<Input
							required
							type="datetime-local"
							name="startDateTime"
							onChange={handleChangeStartDateTime}
							defaultValue={formatDateISO(item.startDateTime)}
						/>
						<label>End Date Time</label>
						<Input
							required
							type="datetime-local"
							name="closeDateTime"
							onChange={handleChangeCloseDateTime}
							defaultValue={formatDateISO(item.closeDateTime)}
						/>
						<Button text="Save" type="primary" />
					</div>
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
