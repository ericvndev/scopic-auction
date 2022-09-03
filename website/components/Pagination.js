import React from 'react';
import PropTypes from 'prop-types';

const Pagination = (props) => {
	const { total, activePage, onChange } = props;
	const dummyArr = new Array(total);
	dummyArr.fill();

	const onClickPage = (page) => {
		onChange(page);
	};

	return (
		<div>
			{dummyArr.map((v, i) => (
				<a key={i} onClick={() => onClickPage(i + 1)}>
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
