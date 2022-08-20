import React, { useEffect }  from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Buttons } from '../components/buttons';
import styles from './styles.module.css';
import Head from '@docusaurus/Head';

export default function IndividualAgency() {
  useEffect(() => {
    const script = document.createElement('script');
  
    script.src = "https://w.office.erxes.io/build/formWidget.bundle.js";
    script.async = true;
  
    document.body.appendChild(script);

    window.erxesSettings = {
      forms: [{
        brand_id: "ZJ7bSh",
        form_id: "PXH7Fc",
      }],
    };
  
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const {tagline, url, favicon} = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  return (
    <Layout
      title="Individual and Agency Marketers "
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
              Individual and Agency Marketers 
            </h1>
          </div>
        </div>
      </header>
      <main>
        <div className="container container-sm">
          <section className={styles.section}>
            <p>
              Interested in using erxes to deliver powerful solutions to your clients? Become an Agency Partner and unlock the benefits that come with a deeper partnership with erxes, your clients, and a global partner community.
            </p>
						<p>
							After the short email series is over, you get occasional emails about erxes. And of course, you can opt-out of any emails from us whenever you want. 
            </p>
						<p>
							We recommend signing up with the same email address that you are likely to use when you download and demo erxes. 
            </p>

						<div className={styles.subscribe} data-erxes-embed="PXH7Fc"></div>
          </section>
        </div>
      </main>
      <div className={styles.cta}>
        <Buttons />
      </div>
    </Layout>
  );
}
