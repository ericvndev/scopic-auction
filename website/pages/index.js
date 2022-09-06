import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { GET_FROM_API } from '../helpers/utils';

import ItemCard from '../components/ItemCard';
import Pagination from '../components/Pagination';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';

import styles from '../styles/Home.module.css';

let searchTimeout = null;

const Home = () => {
	const router = useRouter();
	const searchString = router ? router.query.search : '';
	const [sortBy, setSortBy] = useState('basePrice_desc');
	const [loading, setLoading] = useState(false);
	const [totalItems, setTotalItems] = useState(0);
	const [page, setPage] = useState(1);
	const [items, setItems] = useState([]);

	const fetchData = useCallback(async (page, sortBy, searchString) => {
		try {
			const { items, total } = await GET_FROM_API(
				`/items?limit=10&skip=${
					(page - 1) * 10
				}&sort=${sortBy}&search=${searchString || ''}`
			);
			setItems(items || []);
			setTotalItems(total);
			setLoading(false);
		} catch (error) {
			console.log(error);
		}
	}, []);

	useEffect(() => {
		setLoading(true);
		fetchData(1, sortBy);
	}, []);

	useEffect(() => {
		setLoading(true);
		fetchData(page, sortBy, searchString);
	}, [fetchData, page, searchString, sortBy]);

	useEffect(() => {
		setPage(1);
	}, [searchString, sortBy]);

	const handleSearchBoxChange = (e) => {
		const newSearchValue = e.target.value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(
			() => router.push(`/?search=${newSearchValue}`),
			500
		);
	};

	const handleSortByChange = (e) => {
		const newSortBy = e.target.value;
		setSortBy(newSortBy);
	};

	return (
		<div className="container">
			<Head>
				<title>Home - Scopic Auction</title>
				<meta
					name="description"
					content="Best auction collections in the world"
				/>
			</Head>
			<div className={styles.filterBar}>
				<Input
					key={searchString}
					autoFocus
					className={styles.searchBox}
					type="text"
					placeholder="Search for items..."
					defaultValue={searchString}
					onChange={handleSearchBoxChange}
				/>
				<div className={styles.sort}>
					Sort by{' '}
					<Select
						className={styles.sortSelect}
						value={sortBy}
						options={[
							{
								value: 'basePrice_asc',
								text: 'Base price (ascending)',
							},
							{
								value: 'basePrice_desc',
								text: 'Base price (descending)',
							},
						]}
						onChange={handleSortByChange}
					/>
				</div>
			</div>
			{loading ? (
				<div className={styles.loading}>Loading...</div>
			) : (
				<div className={styles.itemList}>
					{items.length ? (
						items.map((item) => (
							<div className={styles.item} key={item._id}>
								<ItemCard item={item} />
							</div>
						))
					) : (
						<div className={styles.notFound}>No item found</div>
					)}
				</div>
			)}
			{totalItems ? (
				<Pagination
					total={Math.ceil(totalItems / 10)}
					activePage={page}
					onChange={setPage}
				/>
			) : (
				''
			)}
		</div>
	);
};

export default Home;
