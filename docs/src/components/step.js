import React from 'react';
import classnames from 'classnames';
import { Send, Umbrella, Monitor } from 'react-feather';
import { Icon } from './icon'
import styles from './styles.module.css';
import mainStyles from '../pages/styles.module.css';

export const Step = () => {
  return (
		<section className={classnames('center', mainStyles.section)}>
			<h2 className="center">How to join?</h2>
			<div className={classnames('row', styles.step)}>
				<div className="col col--4">
					<Icon icon={Send} />
					<h3>Apply</h3>
					<p>Anyone is welcome to apply. If you’re a good fit for your chosen partnership, we’ll schedule an intro call.</p>
				</div>
				<div className="col col--4">
					<Icon icon={Umbrella} />
					<h3>Sign</h3>
					<p>We'll share our official agreement with you. Once you’ve reviewed and signed it, you’re set.</p>
				</div>
				<div className="col col--4">
					<Icon icon={Monitor} />
					<h3>Onboard</h3>
					<p>Finally, we’ll kick off your onboarding process so you can develop your strategy.</p>
				</div>
			</div>
		</section>
  );
};