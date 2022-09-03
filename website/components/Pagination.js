import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles/Pagination.module.css';

const Pagination = (props) => {
	const { total, activePage, onChange } = props;
	const dummyArr = new Array(total);
	dummyArr.fill();

	const onClickPage = (page) => {
		onChange(page);
	};

	return (
		<div className={styles.pagination}>
			{dummyArr.map((v, i) => (
				<a
					className={`${styles.number} ${
						activePage === i + 1 ? styles.active : ''
					}`}
					key={i}
					onClick={() => onClickPage(i + 1)}
				>
					{i + 1}
				</a>
			))}
		</div>
	);
};

Pagination.propTypes = {
	total: PropTypes.number,
	activePage: PropTypes.number,
	onChange: PropTypes.func,
};

Pagination.defaultProps = {
	total: 1,
	activePage: 1,
	onChange: () => {},
};

export default Pagination;
