import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/FileInput.module.css';

const FileInput = (props) => {
	const { defaultValue, id, required, name } = props;
	const inputRef = useRef();
	const [image, setImage] = useState(defaultValue || undefined);

	useEffect(() => {
		if (required && inputRef.current && !image) {
			inputRef.current.setCustomValidity('Please select a file');
		}
	}, [required, inputRef.current, image]);

	const handleInputChange = (e) => {
		const file = e.currentTarget.files[0];
		const reader = new FileReader();
		e.currentTarget.setCustomValidity('');
		reader.onloadend = function () {
			setImage(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveImage = () => {
		setImage(null);
		inputRef.current.value = '';
	};

	return (
		<div
			className={`${styles.fileInput} ${image ? styles.hasPreview : ''}`}
		>
			<div className={styles.preview}>
				<img src={image} className={styles.image} />
				<div className={styles.remove} onClick={handleRemoveImage}>
					✖
				</div>
			</div>
			<label htmlFor={id} className={styles.label}>
				Choose file
			</label>
			<input
				name={name}
				ref={inputRef}
				className={styles.input}
				id={id}
				type="file"
				accept="image/*"
				onChange={handleInputChange}
			/>
		</div>
	);
};

FileInput.propTypes = {
	defaultValue: PropTypes.string,
	id: PropTypes.string.isRequired,
	required: PropTypes.bool,
	name: PropTypes.string,
};

FileInput.defaultProps = {
	defaultValue: '',
	required: false,
	name: 'file-input',
};

export default FileInput;
