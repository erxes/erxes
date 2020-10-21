import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import classnames from 'classnames';

export const Buttons = () => {
  return (
		<div className={styles.buttons}>
			<Link
				className={classnames(
					'button button--primary button--lg',
					styles.getStarted,
				)}
				to={useBaseUrl('overview/getting-started/')}>
				Get Started
			</Link>
			<Link
				href="https://community.erxes.io/register/Gw4WRJnk9fSbyAXTq"
				className={classnames(
					'button button--outline button--primary button--lg',
					styles.getStarted,
				)}
			>
				Join Our Community
			</Link>
		</div>
  );
};