import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Image from 'next/image';

import Button from '../../components/forms/Button';
import Input from '../../components/forms/Input';
import Checkbox from '../../components/forms/Checkbox';

import { UserContext } from '../../contexts';

import styles from '../../styles/Detail.module.css';
import BiddingHistory from '../../components/BiddingHistory';

const getServerSideProps = async (context) => {
	const { slug } = context.query || {};
	const rs = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/v1/item?filter={"slug": "${slug}"}&populate=bids`
	);

	const data = await rs.json();

	if (!data || !data.data) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			item: data.data,
		},
	};
};

const DetailPage = (props) => {
	const { item } = props;
	const { user, showLoginForm } = useContext(UserContext);
	const [checkedAutobid, setCheckedAutobid] = useState(false);
	const itemImage = item.images.length
		? `${process.env.NEXT_PUBLIC_API_HOST}${item.images[0]}`
		: 'https://picsum.photos/600/400';

	const handleSubmitBid = async (e) => {
		e.preventDefault();
		if (!user) {
			return showLoginForm();
		}
		const form = e.currentTarget;
		const amount = parseInt(form.amount.value || '0');
		const data = {
			amount,
			itemId: item._id,
		};
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_HOST}/v1/bid`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `JWT ${user.token}`,
					},
					body: JSON.stringify(data),
				}
			);
			const { error } = await res.json();
			if (error) {
				throw new Error(error);
			}
		} catch (error) {
			alert(error.message);
		}
	};

	const handleAutobidChange = (e) => {
		setCheckedAutobid(e.target.checked);
	};

	return (
		<div className="container">
			<Head>
				<title>{item.name} - Scopic Auction</title>
				<meta name="description" content={item.description} />
			</Head>
			<div className={styles.detail}>
				<div className={styles.imageContainer}>
					<Image
						src={itemImage}
						layout="fill"
						alt={`Item ${item.name} image`}
						className={styles.image}
					/>
				</div>
				<div className={styles.info}>
					<h1 className={styles.name}>{item.name}</h1>
					<p className={styles.description}>{item.description}</p>
					<div className={styles.price}>
						Starting price: {item.basePrice.toLocaleString()} USD
					</div>
					<div className={styles.currentLabel}>
						Current highest bidding price
					</div>
					<div className={styles.currentPrice}>10,000,000 USD</div>
					<div className={styles.currentLabel}>by User 1</div>
					<div className={styles.bidding}>
						<label htmlFor="bid-input" className={styles.label}>
							Your price
						</label>
						<form onSubmit={handleSubmitBid}>
							<Input
								className={styles.input}
								name="amount"
								id="bid-input"
								type="tel"
								placeholder={`Start from 10,000,000 USD`}
							/>
							<div className={styles.submitGroup}>
								<div className={styles.autobid}>
									<Checkbox
										id="autobid"
										label="Enable Auto-bidding"
										onChange={handleAutobidChange}
										checked={checkedAutobid}
									/>
								</div>
								<Button
									text={'Submit Bid'}
									type="primary"
									className={styles.bidButton}
								/>
							</div>
						</form>
					</div>
				</div>
			</div>
			<div className={styles.biddingHistory}>
				<h2 className={styles.sectionTitle}>Bidding History</h2>
				<BiddingHistory bids={item.bids} />
			</div>
		</div>
	);
};

DetailPage.propTypes = {
	item: PropTypes.object.isRequired,
};

export { getServerSideProps };
export default DetailPage;
