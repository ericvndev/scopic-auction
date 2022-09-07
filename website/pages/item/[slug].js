import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Image from 'next/image';
import { io } from 'socket.io-client';

import Button from '../../components/forms/Button';
import Input from '../../components/forms/Input';
import Checkbox from '../../components/forms/Checkbox';
import BiddingHistory from '../../components/BiddingHistory';
import CountDown from '../../components/CountDown';

import { formatDate, GET_FROM_API, POST_TO_API } from '../../helpers/utils';

import { useUser } from '../../lib/useUser';

import styles from '../../styles/Detail.module.css';

const getServerSideProps = (context) => {
	const { query } = context;

	return {
		props: {
			slug: query.slug,
		},
	};
};

const DetailPage = (props) => {
	const { slug } = props;
	const { user, updateUser } = useUser();

	const [item, setItem] = useState(undefined);
	const [checkedAutobid, setCheckedAutobid] = useState(false);
	const bids = item ? item.bids || [] : [];

	const fetchItem = useCallback(async () => {
		try {
			const data = await GET_FROM_API(
				`/item?filter={"slug": "${slug}"}&populate=bids`
			);
			setItem(data);
		} catch (error) {
			setItem(null);
			console.log(error);
		}
	}, []);

	useEffect(() => {
		if (user && user.enableAutobid && item) {
			setCheckedAutobid(user.enableAutobid.includes(item._id));
		}
	}, [user, item]);

	useEffect(() => {
		const socket = io(`${process.env.NEXT_PUBLIC_API_HOST}?item=${slug}`);
		socket.on('refetch', fetchItem);
		fetchItem();
		return () => {
			socket.disconnect();
			socket.close();
		};
	}, []);

	if (item === undefined) {
		return <div className="container">Loading...</div>;
	} else if (item === null) {
		return <div className="container">Item not found</div>;
	}

	const itemImage = item.images.length
		? `${process.env.NEXT_PUBLIC_API_HOST}${item.images[0]}`
		: 'https://picsum.photos/600/400';

	const submitBid = async (body) => {
		try {
			const data = await POST_TO_API('/bid', body);
			return data;
		} catch (error) {
			console.log(error);
			return null;
		}
	};

	const validateBid = (amount) => {
		if (
			highestBid &&
			highestBid.user &&
			highestBid.user.username === user.username
		) {
			return 'Your latest bid is already the highest bid';
		}
		if (amount <= minPrice) {
			return (
				'Your bid must be higher than ' +
				minPrice.toLocaleString() +
				' USD'
			);
		}
	};

	const handleSubmitBid = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const amount = parseInt(form.amount.value || '0');
		const error = validateBid(amount);
		if (error) {
			return alert(error);
		}
		const body = {
			amount,
			itemId: item._id,
			enableAutoBid: checkedAutobid,
		};
		try {
			await submitBid(body);
		} catch (error) {
			console.log(error);
			alert(error.message);
		}
	};

	const handleAutobidChange = (e) => {
		let newEnableAutobid = [...(user.enableAutobid || [])];
		if (e.target.checked) {
			newEnableAutobid.push(item._id);
		} else {
			newEnableAutobid = newEnableAutobid.filter((i) => i !== item._id);
		}
		updateUser({ enableAutobid: newEnableAutobid });
		setCheckedAutobid(e.target.checked);
	};

	const [highestBid] = [...bids].sort((a, b) => b.amount - a.amount);
	const minPrice = Math.max(highestBid ? highestBid.amount : item.basePrice);
	const title = `${item.name} - Scopic Auction`;
	const notStart = new Date(item.startDateTime) > new Date();
	const ended = new Date(item.closeDateTime) < new Date();

	return (
		<div className="container">
			<Head>
				<title>{title}</title>
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
					{notStart ? (
						<h4 className={styles.bidend}>
							Bidding will start at{' '}
							{formatDate(item.startDateTime)}
						</h4>
					) : (
						<h4 className={styles.bidend}>
							{new Date(item.closeDateTime) > new Date()
								? `Bidding will end on`
								: `Bidding ended on`}{' '}
							{formatDate(item.closeDateTime)}
						</h4>
					)}
					{!ended && !notStart ? (
						<CountDown
							title={'Time left'}
							endDate={new Date(item.closeDateTime)}
						/>
					) : (
						''
					)}
					{highestBid && ended ? (
						<>
							<div className={styles.currentLabel}>
								The winner is{' '}
								{highestBid.user
									? `${highestBid.user.firstName} ${highestBid.user.lastName}`
									: 'N/A'}
								{user &&
								user.username === highestBid.user.username
									? ` (You)`
									: ''}
							</div>
							<div className={styles.currentLabel}>
								with the highest bid at
							</div>
							<div className={styles.currentPrice}>
								{highestBid.amount.toLocaleString()} USD
							</div>
						</>
					) : (
						''
					)}
					{highestBid && !ended ? (
						<>
							<div className={styles.currentLabel}>
								Current highest bid
							</div>
							<div className={styles.currentPrice}>
								{highestBid.amount.toLocaleString()} USD
							</div>
							<div className={styles.currentLabel}>
								by{' '}
								{highestBid.user
									? `${highestBid.user.firstName} ${highestBid.user.lastName}`
									: 'N/A'}
								{user &&
								user.username === highestBid.user.username
									? ` (You)`
									: ''}
							</div>
						</>
					) : (
						''
					)}

					{!notStart && !ended ? (
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
									placeholder={`Start from ${minPrice.toLocaleString()} USD`}
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
					) : (
						''
					)}
				</div>
			</div>
			<div className={styles.biddingHistory}>
				<h2 className={styles.sectionTitle}>Bidding History</h2>
				<BiddingHistory bids={bids} />
			</div>
		</div>
	);
};

DetailPage.propTypes = {
	slug: PropTypes.string.isRequired,
};

export { getServerSideProps };
export default DetailPage;
