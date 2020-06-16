import React from 'react';
import classnames from 'classnames';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './features.module.css';

const rows = [
	{
		title: "1",
		features: [
			{
				title: <>Open-source</>,
				imageUrl: 'img/os.svg',
				description: (
					<>
						An open-source platform means your team retains control over the service's technical roadmap, and your team is free to develop additional features without restriction. Supported by a vibrant open source community.
					</>
				),
			},
			{
				title: <>Security</>,
				imageUrl: 'img/security.svg',
				description: (
					<>
						Erxes offers an all-in-one growth marketing solution behind the banking industry firewall. Run your complete Growth Marketing lifecycle under your existing security and IT policies. Deploy to public, private, or hybrid clouds with full access to source code and total control of your single-tenant system.
					</>
				),
			},
			{
				title: <>Privacy</>,
				imageUrl: 'img/privacy.svg',
				description: (
					<>
						Clients' IP address, usage patterns, the contents of your messages — SaaS services know more about your company than you do. In contrast, erxes provides the benefits of an all-in-one marketing solution without sacrificing privacy.
					</>
				),
			},
		]
	},
	{
		title: "2",
		features: [
			{
				title: <>Legal Compliance</>,
				imageUrl: 'img/gdpr.svg',
				description: (
					<>
						Consumer data protection laws, data regulations, GDPR, and even non-disclosure agreements are complex and ever-changing, with heavy penalties for breach. Self- hosting your marketing, sales, and customer support software simplifies compliance and reduces risk.
					</>
				),
			},
			{
				title: <>Extensibility</>,
				imageUrl: 'img/extend.svg',
				description: (
					<>
						Erxes offers enterprise-grade customization with complete access to source code, UI text files, APIs, drivers, and a wide array of open-source integrations and samples. Whether it's branding the login page or white-labeling mobile apps, the enterprise is in total control.
					</>
				),
			},
			{
				title: <>Scalability</>,
				imageUrl: 'img/scale.svg',
				description: (
					<>
						Erxes was built ground-up for enterprise with a single-tenant private cloud architecture offering high availability and horizontal scaling. Tens of thousands of users can operate out of a single team, and hundreds of teams can be deployed in an enterprise.
					</>
				),
			},
		]
	}
  
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <img className={styles.featureImage} src={imgUrl} alt={title} />
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export const Features = () => {
  return (
		<main>
			{rows && rows.length > 0 && (
				<section className={styles.features}>
					<div className="container">
						{rows.map(row => (
							<div key={row.title} className="row">
								{row.features.map((props) => (
									<Feature key={props.imageUrl} {...props} />
								))}
							</div>
						))}
					</div>
				</section>
			)}
		</main>
  );
};