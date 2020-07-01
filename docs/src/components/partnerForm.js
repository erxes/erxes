import React from 'react';
import styles from './styles.module.css';

export const PartnerForm = ({ src, height }) => {
  return (
		<div className={styles.iframe}>
			<iframe 
        src={src}
        title="partner-application"
        width="100%"
        height={height}
      />
		</div>
  );
};