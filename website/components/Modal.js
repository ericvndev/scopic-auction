import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import styles from '../styles/Modal.module.css';

const Modal = (props) => {
	const { show, children, onClose } = props;

	const handleBackdropClick = () => {
		if (onClose) {
			onClose();
		}
	};

	useEffect(() => {
		if (show) {
			document.body.style = 'overflow: hidden';
		} else {
			document.body.style = '';
		}
	}, [show]);

	if (!show) {
		return '';
	}

	return (
		<div className={styles.modal}>
			<div className={styles.backdrop} onClick={handleBackdropClick} />
			<div className={styles.content}>{children}</div>
		</div>
	);
};

Modal.propTypes = {
	show: PropTypes.boolean,
	children: PropTypes.node.isRequired,
	onClose: PropTypes.func,
};

Modal.defaultProps = {
	show: false,
	onClose: () => {},
};

export default Modal;
