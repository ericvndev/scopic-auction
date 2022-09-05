import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

import Button from './forms/Button';
import { formatDate } from '../helpers/utils';

import styles from '../styles/ItemCard.module.css';

const ItemCard = (props) => {
	const { item } = props;

	const itemImage = item.images.length
		? `${process.env.NEXT_PUBLIC_API_HOST}${item.images[0]}`
		: 'https://picsum.photos/600/400';

	const handleBidNowClick = () => {
		window.open(`/item/${item.slug}`);
	};

	const endDate = new Date(item.closeDateTime);

	return (
		<div className={styles.card}>
			<div className={styles.image}>
				<Image
					layout="fill"
					objectFit="contain"
					objectPosition="center"
					src={itemImage}
					alt={`Item ${item.name} image`}
				/>
			</div>
			<div className={styles.info}>
				<div className={styles.name}>{item.name}</div>
				<p className={styles.description}>{item.description}</p>
				<div className={styles.price}>
					Start from {item.basePrice.toLocaleString()} USD
				</div>
				<div className={styles.date}>
					Close at {formatDate(endDate)}
				</div>
			</div>
			<div className={styles.footer}>
				<Button
					text="Bid Now"
					type="primary"
					onClick={handleBidNowClick}
				/>
			</div>
		</div>
	);
};

ItemCard.propTypes = {
	item: PropTypes.object.isRequired,
};

export default ItemCard;
