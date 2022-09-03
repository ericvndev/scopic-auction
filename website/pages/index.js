import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import Head from 'next/head';
import ItemCard from '../components/ItemCard';
import styles from '../styles/Home.module.css';
import Pagination from '../components/Pagination';

const getStaticProps = async () => {
	const res = await fetch('http://localhost:3000/v1/items/count');
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

	const fetchData = useCallback(async () => {
		const rs = await fetch(
			`http://localhost:3000/v1/items?limit=10&skip=${(page - 1) * 10}`
		);
		const data = await rs.json();
		setItems(data);
		setLoading(false);
	}, [page]);

	useEffect(() => {
		setLoading(true);
		fetchData();
	}, []);

	return (
		<div className={styles.container}>
			<Head>
				<title>Home - Scopic Auction</title>
				<meta
					name="description"
					content="Best auction collections in the world"
				/>
				<link rel="icon" href="/images/scopic-icon-32x32.png" />
			</Head>
			{loading ? (
				<div>Loading...</div>
			) : (
				<div>
					{items.map((item) => (
						<ItemCard key={item._id} item={item} />
					))}
				</div>
			)}
			<Pagination total={Math.ceil(totalItems / 10)} activePage={page} />
		</div>
	);
};

Home.propTypes = {
	totalItems: PropTypes.number.isRequired,
};

export { getStaticProps };
export default Home;
