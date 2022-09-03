import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Button.module.css';

const Button = (props) => {
	const { text, onClick, type, className } = props;

	return (
		<button
			className={`${styles.button} ${styles[type]} ${className}`}
			onClick={onClick}
		>
			{text}
		</button>
	);
};

Button.propTypes = {
	text: PropTypes.string,
	onClick: PropTypes.func,
	className: PropTypes.string,
};

Button.defaultProps = {
	text: 'button',
	onClick: () => {},
	className: '',
};

export default Button;
