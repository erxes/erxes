import React from 'react';
import styles from './styles.module.css';

export const Icon = ({ icon: Icon }) => {
  return (
		<div className={styles.iconWrapper}>
			<Icon size={30} />
		</div>
  );
};