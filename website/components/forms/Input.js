import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Input.module.css';

const Input = (props) => {
	const { className, ...other } = props;

	return <input className={`${styles.input} ${className}`} {...other} />;
};

Input.propTypes = {
	className: PropTypes.string,
};

Input.defaultProps = {
	className: '',
};

export default Input;
