import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/Dropdown.module.css';

const Dropdown = (props) => {
	const { children, options, onClose } = props;
	const refWrapper = useRef();
	const [showDropdown, setShowDropdown] = useState(false);

	useEffect(() => {
		const bodyClickHandler = (e) => {
			const target = e.target;
			if (target.closest('.js-dropdown') === refWrapper.current) {
				return;
			}
			setShowDropdown(false);
			if (onClose) {
				onClose();
			}
		};
		document.body.addEventListener('click', bodyClickHandler);
		return () => {
			document.body.removeEventListener('click', bodyClickHandler);
		};
	}, []);

	const handleTriggerShow = () => {
		setShowDropdown(true);
	};

	return (
		<div className={`${styles.wrapper} js-dropdown`} ref={refWrapper}>
			<div className={styles.trigger} onClick={handleTriggerShow}>
				{children}
			</div>
			{showDropdown ? (
				<div className={`${styles.dropdown}`}>
					<ul className={styles.list}>
						{options.map((opt, i) => (
							<li
								className={`${styles.item} ${
									opt.highlight ? styles.highlight : ''
								}`}
								key={`${opt.text} ${i}`}
								onClick={() => {
									setShowDropdown(false);
									opt.handler();
								}}
							>
								{opt.text}
							</li>
						))}
					</ul>
				</div>
			) : (
				''
			)}
		</div>
	);
};

Dropdown.propTypes = {
	children: PropTypes.node.isRequired,
	options: PropTypes.array,
	onShow: PropTypes.func,
	onClose: PropTypes.func,
};

Dropdown.defaultProps = {
	options: [],
	onShow: null,
	onClose: null,
};

export default Dropdown;
