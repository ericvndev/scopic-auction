import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Input.module.css';

const Input = (props) => {
	const { className, isFull, ...other } = props;

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
	className: PropTypes.string,
};

Input.defaultProps = {
	isFull: false,
	className: '',
};

export default Input;
