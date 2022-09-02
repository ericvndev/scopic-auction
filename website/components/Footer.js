import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles/Footer.module.css';

const Footer = (props) => {
	return <footer className={styles.footer}>&copy; Copyright 2022</footer>;
};

Footer.propTypes = {};

export default Footer;
