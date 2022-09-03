import React from 'react';
import PropTypes from 'prop-types';

const ItemCard = (props) => {
	const { item } = props;
	return <div>{item.name}</div>;
};

ItemCard.propTypes = {
	item: PropTypes.object.isRequired,
};

export default ItemCard;
