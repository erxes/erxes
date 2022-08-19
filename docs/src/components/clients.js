import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const clients = [
	{
		src: 'img/clients/kfc.png',
		alt: 'KFC'
	},
	{
		src: 'img/clients/xerox.png',
		alt: 'Xerox'
	},
	{
		src: 'img/clients/pizzahut.png',
		alt: 'Pizza hut'
	},
	{
		src: 'img/clients/toto.png',
		alt: 'TOTO'
	},
	{
		src: 'img/clients/toyota.png',
		alt: 'Toyota'
	},
	{
		src: 'img/clients/bridgestone.png',
		alt: 'Bridgestone'
	},
	{
		src: 'img/clients/vw.png',
		alt: 'Volkswagen'
	},
	{
		src: 'img/clients/godiva.png',
		alt: 'Godiva'
	},
	{
		src: 'img/clients/hankook.png',
		alt: 'Hankook'
	},
];

export const Clients = () => {
  return (
		<section className={styles.clientsWrapper}>
			<div className="container">
				<h2>Trusted by hundreds of companies across the world.</h2>
				<div className={styles.clients}>
					{clients.map(({src, alt}) => {
						return (
							<img
								key={alt}
								alt={alt}
								src={useBaseUrl(src)}
							/>
						);
					})}
				</div>
			</div>
		</section>
  );
};