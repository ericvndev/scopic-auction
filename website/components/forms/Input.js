import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Input.module.css';

const Input = (props) => {
	const { className, isFull, multiline, ...other } = props;
	if (multiline) {
		return (
			<textarea
				className={`${styles.textarea} ${className} ${
					isFull ? styles.full : ''
				}`}
				{...other}
			/>
		);
	}

	return (
		<input
			className={`${styles.input} ${className} ${
				isFull ? styles.full : ''
			}`}
			{...other}
		/>
	);
};

Input.propTypes = {
	isFull: PropTypes.bool,
	multiline: PropTypes.bool,
	className: PropTypes.string,
};

Input.defaultProps = {
	isFull: false,
	multiline: false,
	className: '',
};

export default Input;
