import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import Table from '../../docs/partner-developer.md';
import { PartnerForm } from '../components/partnerForm';
import { Step } from '../components/step';
import { Buttons } from '../components/buttons';

export default function Developer() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const {tagline, url, favicon} = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  return (
    <Layout
      title="Developer Partner"
      description={tagline}
      ogImage={ogImage}
      url={url}
      favicon={favicon}
    >
      <Head>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
      </Head>
      <header id="hero" className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.headingOne}>
							Developer Partner
            </h1>
            <p className={styles.description}>
							Interested in using erxes for your clients? Start by becoming a Developer Partner. It’s a low-cost and low-commitment way to see what a partnership with us could do for your business. And with a low monthly cost and monthly billing, you can stop when you want.

            </p>
						<p className={styles.suggestion}>or</p>
            <Link
              className="button button--outline button--primary"
              to={useBaseUrl('agency/')}>
              Become Agency Partner
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="container">
          <section className={classnames('center-desktop', styles.section)}>
            <h2>Are you a good fit?</h2>

            <h3>Become a developer partner if:</h3>
            <ol className={styles.list}>
              <li>You’re a freelance developer with a knack for sales and marketing</li>
              <li>You’re interested in offering erxes to your clients and earning a commission for what you sell.</li>
              <li>You already use erxes to build customer-centric solutions for your clients and your business.</li>
            </ol>

            <div className={styles.tableWrapper}>
              <Table />
            </div>
          </section>
					
					<Step />
          
          <PartnerForm height="1550px" src="https://application.partnerstack.com/application?company=erxes&group=developerpartners" />  
        </div>
      </main>
      <div className={styles.cta}>
        <Buttons />
      </div>
    </Layout>
  );
}
