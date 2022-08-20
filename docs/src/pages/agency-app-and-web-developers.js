import React, { useEffect } from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Buttons } from '../components/buttons';
import styles from './styles.module.css';
import Head from '@docusaurus/Head';

export default function AgencyAppDevelopers() {
  useEffect(() => {
    const script = document.createElement('script');
  
    script.src = "https://w.office.erxes.io/build/formWidget.bundle.js";
    script.async = true;
  
    document.body.appendChild(script);

    window.erxesSettings = {
      forms: [{
        brand_id: "ZJ7bSh",
        form_id: "r57v72",
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
      title="Agency App and Web Developers"
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
              Agency App and Web Developers
            </h1>
          </div>
        </div>
      </header>
      <main>
        <div className="container container-sm">
          <section className={styles.section}>
            <p>
							When you sign-up to the newsletter below, you experience the exact same erxes experience that your customers and clients will. For one, we will automatically add you to a segmented list so that we only send you emails that you will be interested in, then you will subscribed to a short series of emails exploring erxes and how erxes can help you quite literally add extra money to each client transaction, improve your customer experience and help you to integrate erxes into your own app and website as simple integrations.
            </p>
						<p>
							After the short email series is over, you get occasional emails about erxes. And of course, you can opt-out of any emails from us whenever you want. 
            </p>
						<p>
							We recommend signing up with the same email address that you are likely to use when you download and demo erxes. 
            </p>

            <div data-erxes-embed="r57v72" className={styles.subscribe}></div>
          </section>
        </div>
      </main>
      <div className={styles.cta}>
        <Buttons />
      </div>
    </Layout>
  );
}
