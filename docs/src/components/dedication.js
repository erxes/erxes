import React from 'react';
import classnames from 'classnames';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export const Dedication = () => {
  return (
		<main>
			<section className={styles.dedicationWrapper}>
				<div className="container">
					<div className="row">
						<div className={classnames('col col--6')}>
							<div className={styles.item}>
								<img className={styles.featureImage} src="img/marketer.svg" alt="Individual and Agency Marketers" />
								<h2>Individual and Agency Marketers</h2>
								<p className={styles.description}>
									The erxes platform is ideal for individual marketers managing multiple brands and web properties. All features of erxes are available across multiple instances of an erxes installation. This means you can manage all your properties in one place including customer service and Sales.
								</p>
								<Link href="/individual-and-agency-marketers" className={styles.link}>Learn More »</Link>
							</div>
						</div>
						<div className={classnames('col col--6')}>
							<div className={styles.item}>
								<img className={styles.featureImage} src="img/developer.svg" alt="Individual and Agency Web and App Developers" />
								<h2>Individual and Agency Web and App Developers</h2>
								<p className={styles.description}>
									The erxes platform is ideal for individual web and app developers looking to offer customers additional tools to help their businesses achieve their business objectives. Integrated into one platform the open source version can be maintained by agency developers as an extra service they can offer.
								</p>
								<Link href="/agency-app-and-web-developers" className={styles.link}>Learn More »</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
  );
};