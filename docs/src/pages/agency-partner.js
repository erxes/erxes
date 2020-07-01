import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Buttons } from '../components/buttons';
import styles from './styles.module.css';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import Table from '../../docs/partner-agency.md';
import { PartnerForm } from '../components/partnerForm';
import { Step } from '../components/step';

export default function Agency() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const {tagline, url, favicon} = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  return (
    <Layout
      title="Agency Partner"
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
              Agency Partner
            </h1>
            <p className={styles.description}>
              Interested in using erxes to deliver powerful solutions to your clients? Become an Agency Partner and unlock the benefits that come with a deeper partnership with erxes, your clients, and a global partner community.
            </p>
            <p className={styles.suggestion}>
              or
            </p>
            <Link
              className="button button--outline button--primary"
              to={useBaseUrl('developer/')}>
              Become Developer Partner
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="container">
          <section className={classnames('center-desktop', styles.section)}>
            <h2>Are you a good fit?</h2>

            <h3>Become an agency partner if:</h3>
            <ol className={styles.list}>
              <li>You represent an agencies, business process outsourcer, systems integrator or consoltancy</li>
              <li>You provide consulting on business, technology, sales, marketing, or customer service strategy.</li>
              <li>You provide tech implementation that handles CRM, systems integrations, or IT services.</li>
              <li>You provide hands-on services in marketing, sales, or customer service.</li>
            </ol>
            <div className={styles.tableWrapper}>
              <Table />
            </div>
          </section>

          <Step />
          <PartnerForm height="1645px" src="https://application.partnerstack.com/application?company=erxes&group=agencypartners" />  
        </div>
      </main>
      <div className={styles.cta}>
        <Buttons />
      </div>
    </Layout>
  );
}
