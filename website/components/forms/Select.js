import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Select.module.css';

const Select = (props) => {
	const { options, className, ...other } = props;

	return (
		<select className={`${styles.select} ${className}`} {...other}>
			{options.map((opt) => (
				<option value={opt.value} key={opt.value}>
					{opt.text}
				</option>
			))}
		</select>
	);
};

Select.propTypes = {
	options: PropTypes.arrayOf(PropTypes.object),
	className: PropTypes.string,
};

Select.defaultProps = {
	options: [],
	className: '',
};

export default Select;
