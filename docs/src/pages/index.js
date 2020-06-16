import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Clients } from '../components/clients';
import { Features } from '../components/features';
import styles from './styles.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
      <h1 className={styles.headingOne}>
        All-in-one growth marketing & management software
      </h1>
      <h2 className={styles.description}>
        erxes is a free and open fair-code licensed all-in-one solution for <b>sales</b>, <b>marketing</b>, and <b>customer service</b> teams, with a focus on the entire customer experience.
      </h2>
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
      <h6 className={styles.suggestion}>
        Are you looking for plug-and-play, easy to use, and flexibility that scales? 
        <a href="https://erxes.io/" target="_blank"> Try <b>erxes Cloud</b></a>
      </h6>
    </div>
  );
};

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const {title, tagline, url, favicon} = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  return (
    <Layout
      title={`${title} - ${tagline}`}
      description={tagline}
      ogImage={ogImage}
      url={url}
      favicon={favicon}
    >
      <header id="hero" className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <Header />
        </div>
      </header>
      <Clients />
      <Features />
    </Layout>
  );
}

export default Home;
