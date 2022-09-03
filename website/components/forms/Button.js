import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Button.module.css';

const Button = (props) => {
	const { text, onClick, type } = props;

	return (
		<button
			className={`${styles.button} ${styles[type]}`}
			onClick={onClick}
		>
			{text}
		</button>
	);
};

Button.propTypes = {
	text: PropTypes.string,
	onClick: PropTypes.func,
};

Button.defaultProps = {
	text: 'button',
	onClick: () => {},
};

export default Button;
