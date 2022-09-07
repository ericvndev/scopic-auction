import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { formatDate, GET_FROM_API, POST_TO_API } from '../helpers/utils';
import { useUser } from '../lib/useUser';

import Pagination from '../components/Pagination';
import UpsertItem from '../components/UpsertItem';
import Input from '../components/forms/Input';
import Button from '../components/forms/Button';

import styles from '../styles/Dashboard.module.css';

const getServerSideProps = (context) => {
	const { search } = context.query;
	return {
		props: {
			search: search || '',
		},
	};
};

let searchTimeout = null;

const DashboardPage = (props) => {
	const { search } = props;
	const router = useRouter();
	const searchString = router ? router.query.search : search;
	const { user } = useUser();
	const [totalItems, setTotalItems] = useState(0);
	const [items, setItems] = useState([]);
	const [page, setPage] = useState(1);
	const [upsertItem, setUpsertItem] = useState(null);

	const fetchItems = useCallback(async (page, searchString) => {
		try {
			const { items, total } = await GET_FROM_API(
				`/items?limit=10&skip=${
					(page - 1) * 10
				}&sort=createdAt_desc&search=${searchString || ''}`
			);
			setItems(items);
			setTotalItems(total);
		} catch (error) {
			alert(error.message);
		}
	}, []);

	const deleteItem = useCallback(
		async (id) => {
			try {
				await POST_TO_API(`/item/${id}`, null, 'DELETE');
				fetchItems(page);
			} catch (error) {
				alert(error.message);
			}
		},
		[user, page]
	);

	useEffect(() => {
		if (user && user.isLoggedIn && user.role !== 'admin') {
			return router.push('/login');
		}
		if (user && user.isLoggedIn && user.role === 'admin') {
			fetchItems(1, searchString);
		}
	}, [user, searchString]);

	const handleCreateClick = () => {
		setUpsertItem({});
	};

	const handleDeleteClick = (item) => {
		const confirmation = confirm(
			'Are you sure you want to delete this item?'
		);
		if (confirmation) {
			deleteItem(item._id);
		}
	};

	const handleSearchBoxChange = (e) => {
		const newSearchValue = e.target.value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			router.push(`/dashboard?search=${newSearchValue}`);
			setPage(1);
		}, 500);
	};

	const handleChangePage = (page) => {
		setPage(page);
		fetchItems(page);
	};

	const handleCloseUpsertModal = () => {
		setUpsertItem(null);
	};

	const handleUpdated = () => {
		fetchItems(page);
		setUpsertItem(null);
	};

	return (
		<div className={styles.dashboard}>
			<h1 className={styles.title}>Dashboard</h1>
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
				<Button
					type="primary"
					text="Create"
					className={styles.create}
					onClick={handleCreateClick}
				/>
			</div>
			<table className={styles.table}>
				<colgroup>
					<col style={{ width: '30%' }} />
					<col style={{ width: '30%' }} />
					<col style={{ width: '10%' }} />
					<col style={{ width: '10%' }} />
					<col style={{ width: '10%' }} />
					<col style={{ width: '10%' }} />
				</colgroup>
				<thead>
					<tr>
						<th>Slug</th>
						<th>Name</th>
						<th className={styles.right}>Base Price</th>
						<th className={styles.right}>Start Date</th>
						<th className={styles.right}>End Date</th>
						<th className={styles.right}>Action</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item) => (
						<tr key={item._id}>
							<td>
								<Link href={`/item/${item.slug}`}>
									<span className={styles.link}>
										{item.slug}
									</span>
								</Link>
							</td>
							<td>{item.name}</td>
							<td className={styles.right}>
								{item.basePrice.toLocaleString()} USD
							</td>
							<td className={styles.right}>
								{formatDate(item.startDateTime)}
							</td>
							<td className={styles.right}>
								{formatDate(item.closeDateTime)}
							</td>
							<td className={styles.right}>
								<span
									className={styles.link}
									onClick={() => setUpsertItem(item)}
								>
									Edit
								</span>
								&nbsp;&nbsp;
								<span
									className={styles.link}
									onClick={() => handleDeleteClick(item)}
								>
									Delete
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<Pagination
				total={Math.ceil(totalItems / 10)}
				activePage={page}
				onChange={handleChangePage}
			/>
			<UpsertItem
				item={upsertItem}
				onClose={handleCloseUpsertModal}
				onUpdated={handleUpdated}
			/>
		</div>
	);
};

DashboardPage.propTypes = {
	search: PropTypes.string,
};

DashboardPage.defaultProps = {
	search: '',
};

export { getServerSideProps };

export default DashboardPage;
