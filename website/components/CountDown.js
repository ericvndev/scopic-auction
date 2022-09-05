import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import styles from '../styles/CountDown.module.css';

const CountDown = (props) => {
	const { title, endDate } = props;
	const [timeleft, setTimeleft] = useState(0);
	const date = new Date(endDate);

	useEffect(() => {
		setInterval(() => {
			setTimeleft(Math.abs(date - Date.now()));
		}, 1000);
	}, []);

	const days = Math.floor(timeleft / 86400000);
	let left = timeleft % 86400000;
	const hours = Math.floor(left / 3600000);
	left = left % 3600000;
	const minutes = Math.floor(left / 60000);
	left = left % 60000;
	const seconds = Math.floor(left / 1000);

	return (
		<div>
			<h4 className={styles.title}>{title}</h4>
			<div className={styles.countdown}>
				<div className={styles.item}>
					<span className={styles.number}>
						{`0${days}`.slice(-2)}
					</span>
					<span className={styles.label}>Days</span>
				</div>
				<div className={styles.item}>
					<span className={styles.number}>
						{`0${hours}`.slice(-2)}
					</span>
					<span className={styles.label}>Hours</span>
				</div>
				<div className={styles.item}>
					<span className={styles.number}>
						{`0${minutes}`.slice(-2)}
					</span>
					<span className={styles.label}>Minutes</span>
				</div>
				<div className={styles.item}>
					<span className={styles.number}>
						{`0${seconds}`.slice(-2)}
					</span>
					<span className={styles.label}>Seconds</span>
				</div>
			</div>
		</div>
	);
};

CountDown.propTypes = {
	title: PropTypes.string,
	endDate: PropTypes.instanceOf(Date).isRequired,
};

CountDown.defaultProps = {
	title: '',
};

export default CountDown;
