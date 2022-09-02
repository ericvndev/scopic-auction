import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

const getStaticProps = async () => {
	// const res = await fetch('http://localhost:3000/v1/items');
	// const data = await res.json();
	return {
		props: {
			items: [],
		},
	};
};

const Home = (props) => {
	console.log(props);
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
		</div>
	);
};

export { getStaticProps };
export default Home;
