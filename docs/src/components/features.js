import React from 'react';
import classnames from 'classnames';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const rows = [
	{
		title: "1",
		features: [
			{
				title: "Customer Service & Ticketing",
				imageUrl: 'img/service.svg',
				description: (
					<>
						Quickly start servicing any volume of customer tickets and customer service inquiries or complaints. Integrated into the entire framework, your customer service activities are no longer hidden in a separate system away from Sales and/or Marketing. 
					</>
				),
			},
			{
				title: "Pop-ups, Lead capture and forms for serious websites",
				imageUrl: 'img/lead.svg',
				even: true,
				description: (
					<>
						Easily create forms, pop-ups and lead capture sequences that match your design, your format and using the images and text you know works for your business. If you don't know where to start, use one of our customizable forms.
					</>
				),
			},
			{
				title: "Email marketing and autoresponder sequences",
				imageUrl: 'img/marketing.svg',
				description: (
					<>
						Your email campaigns are only limited by your own creativity and efforts. You are not limited with email sending limits that skyrocket out of control with high costs. Make unlimited autoresponders that fit your complete email or segmented lists.
					</>
				),
			},
		]
	},
	{
		title: "2",
		features: [
			{
				title: "Website Live Chat and Automated Chat",
				imageUrl: 'img/chat.svg',
				description: (
					<>
						With one copy/pasted JavaScript code you can start immediately chatting with your website visitors live, or offer automatic messaging pop-up when you are not available. Help your customers at the exact moment they are visiting your website and interested in your products or services.
					</>
				),
			},
			{
				title: "Integrate your Social Channels",
				imageUrl: 'img/extend.svg',
				even: true,
				description: (
					<>
						The powerful inbox consolidates all your channels into one easy to manage and use inbox. Customizable to work with your work-flow, you can now integrate with popular social media channels, emails and website chat to stay on top of all your communication channels.
					</>
				),
			},
			{
				title: "Manage your project across teams and brands",
				imageUrl: 'img/scale.svg',
				description: (
					<>
						Intuitive and integrated, the kanban style (think Trello) project management boards will increase productivity for your and your teams as everything is integrated with the customer journey for your company.
					</>
				),
			},
		]
	}
];

function Feature({imageUrl, title, description, even}) {
	const imgUrl = useBaseUrl(imageUrl);
	
  return (
    <div className={classnames('col col--4', { 'even-column': even })}>
      {imgUrl && (
        <img className={styles.featureImage} src={imgUrl} alt={title} />
      )}
      <h2>{title}</h2>
      <p className={styles.description}>{description}</p>
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