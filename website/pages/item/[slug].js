import React, { useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Image from 'next/image';
import { io } from 'socket.io-client';

import Button from '../../components/forms/Button';
import Input from '../../components/forms/Input';
import Checkbox from '../../components/forms/Checkbox';
import BiddingHistory from '../../components/BiddingHistory';
import CountDown from '../../components/CountDown';

import { formatDate } from '../../helpers/utils';

import { UserContext } from '../../contexts';

import styles from '../../styles/Detail.module.css';

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
	const { user, showLoginForm, update: updateUser } = useContext(UserContext);

	const [checkedAutobid, setCheckedAutobid] = useState(false);
	const [bids, setBids] = useState(item ? item.bids || [] : []);

	const refetchItem = useCallback(async () => {
		const rs = await fetch(
			`${process.env.NEXT_PUBLIC_API_HOST}/v1/item?filter={"slug": "${item.slug}"}&populate=bids`
		);
		const { data: newItem } = await rs.json();
		setBids(newItem.bids);
	}, []);

	useEffect(() => {
		if (user && user.enableAutobid) {
			setCheckedAutobid(user.enableAutobid.includes(item._id));
		}
	}, [user]);

	useEffect(() => {
		const socket = io(`http://localhost:3000?item=${item.slug}`);
		socket.on('refetch', refetchItem);
		return () => {
			socket.disconnect();
			socket.close();
		};
	}, []);

	const itemImage = item.images.length
		? `${process.env.NEXT_PUBLIC_API_HOST}${item.images[0]}`
		: 'https://picsum.photos/600/400';

	const submitBid = async (body, user) => {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/bid`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `JWT ${user.token}`,
			},
			body: JSON.stringify(body),
		});
		const { error, data } = await res.json();
		if (error) {
			throw new Error(error);
		}
		return data;
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
		if (!user) {
			return showLoginForm();
		}
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
			await submitBid(body, user);
		} catch (error) {
			console.log(error);
			alert(error.message);
		}
	};

	const handleAutobidChange = (e) => {
		if (!user) {
			return showLoginForm();
		}
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
					<h4 className={styles.bidend}>
						{new Date(item.closeDateTime) > new Date()
							? `Bidding will end on`
							: `Bidding ended on`}{' '}
						{formatDate(item.closeDateTime)}
					</h4>
					{new Date(item.closeDateTime) > new Date() ? (
						<CountDown
							title={'Time left'}
							endDate={new Date(item.closeDateTime)}
						/>
					) : (
						''
					)}
					{highestBid ? (
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
	item: PropTypes.object.isRequired,
};

export { getServerSideProps };
export default DetailPage;
