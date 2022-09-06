import React, { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { formatDate, GET_FROM_API, POST_TO_API } from '../helpers/utils';
import { useUser } from '../lib/useUser';
import Pagination from '../components/Pagination';

import styles from '../styles/Dashboard.module.css';

const DashboardPage = () => {
	const router = useRouter();
	const searchString = router ? router.query.search : '';
	const { user } = useUser();
	const [totalItems, setTotalItems] = useState(0);
	const [items, setItems] = useState([]);
	const [page, setPage] = useState(1);

	const fetchItems = useCallback(async (page, searchString) => {
		try {
			const { items, total } = await GET_FROM_API(
				`/items?limit=10&skip=${(page - 1) * 10}&search=${
					searchString || ''
				}`
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
			router.push('/login');
		} else {
			fetchItems(1);
		}
	}, [user]);

	useEffect(() => {
		fetchItems(page, searchString);
	}, [page, searchString]);

	const handleDeleteClick = (item) => {
		const confirmation = confirm(
			'Are you sure you want to delete this item?'
		);
		if (confirmation) {
			deleteItem(item._id);
		}
	};

	const handleChangePage = (page) => {
		setPage(page);
	};

	return (
		<div className={styles.dashboard}>
			<h1 className={styles.title}>Dashboard</h1>
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
								<span className={styles.link}>Edit</span>
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
		</div>
	);
};

export default DashboardPage;
