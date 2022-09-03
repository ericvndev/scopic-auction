import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import Head from 'next/head';
import ItemCard from '../components/ItemCard';
import styles from '../styles/Home.module.css';
import Pagination from '../components/Pagination';

const getStaticProps = async () => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/v1/items/count`
	);
	const data = await res.json();

	return {
		props: {
			totalItems: data.total || 0,
		},
	};
};

const Home = (props) => {
	const { totalItems } = props;
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [items, setItems] = useState([]);

	const fetchData = useCallback(async (page) => {
		const rs = await fetch(
			`${process.env.NEXT_PUBLIC_API_HOST}/v1/items?limit=10&skip=${
				(page - 1) * 10
			}`
		);
		const data = await rs.json();
		setItems(data.data);
		setLoading(false);
	}, []);

	useEffect(() => {
		setLoading(true);
		fetchData(1);
	}, []);

	useEffect(() => {
		fetchData(page);
	}, [fetchData, page]);

	return (
		<div className="container">
			<Head>
				<title>Home - Scopic Auction</title>
				<meta
					name="description"
					content="Best auction collections in the world"
				/>
			</Head>
			{loading ? (
				<div>Loading...</div>
			) : (
				<div className={styles.itemList}>
					{items.map((item) => (
						<div className={styles.item} key={item._id}>
							<ItemCard item={item} />
						</div>
					))}
				</div>
			)}
			<Pagination
				total={Math.ceil(totalItems / 10)}
				activePage={page}
				onChange={setPage}
			/>
		</div>
	);
};

Home.propTypes = {
	totalItems: PropTypes.number.isRequired,
};

export { getStaticProps };
export default Home;
