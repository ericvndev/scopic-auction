import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Checkbox.module.css';

const Checkbox = (props) => {
	const { className, checked, id, label, ...other } = props;

	return (
		<div className={`${className} ${styles.checkbox}`}>
			<input
				type="checkbox"
				id={id}
				checked={checked}
				className={styles.input}
				{...other}
			/>
			<label
				htmlFor={id}
				className={`${styles.box} ${checked ? styles.checked : ''}`}
			>
				{label}
			</label>
		</div>
	);
};

Checkbox.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	checked: PropTypes.bool,
};

Checkbox.defaultProps = {
	checked: false,
	label: '',
};

export default Checkbox;
