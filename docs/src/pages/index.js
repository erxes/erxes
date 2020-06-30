import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Clients } from '../components/clients';
import { Features } from '../components/features';
import { Buttons } from '../components/buttons';
import { Dedication } from '../components/dedication';
import styles from './styles.module.css';
import Head from '@docusaurus/Head';

const Header = () => {
  return (
    <div className={styles.header}>
      <h1 className={styles.headingOne}>
        Combine all your business tools into one streamlined and integrated free and open-source framework
      </h1>
      <p className={styles.description}>
        erxes acts as your all-one-solution replacing random and incompatible <b>marketing</b>, <b>sales</b> and <b>customer service</b> services with one focused on the entire customer experience.
      </p>
      <Buttons />
      <p className={styles.suggestion}>
        Due to the minimum hosting requirements, many small businesses will benefit from using our flexible and scalable cloud product for real production sites. Are you looking for a flexible and scalable option with low-effort set up?
        <a href="https://erxes.io/" target="_blank"> Try <b>erxes Cloud</b></a>
      </p>
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
      title={title}
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
          <Header />
        </div>
      </header>
      <Dedication />
      <Clients />
      <Features />
      <div className={styles.cta}>
        <Buttons />
      </div>
    </Layout>
  );
}

export default Home;
