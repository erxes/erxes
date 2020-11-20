import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { InvestCSO } from "../components/investCSO";
import { InvestEquity } from "../components/InvestEquity";
import { InvestFAQ } from "../components/InvestFAQ";

export default function Invest() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { tagline, url, favicon } = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  return (
    <Layout
      title="Invest in erxes"
      description={tagline}
      ogImage={ogImage}
      url={url}
      favicon={favicon}
    >
      <Head>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
      </Head>
      <header
        id="hero"
        className={classnames("hero hero--primary", styles.heroBanner)}
      >
        <div className="container">
          <div className={styles.header}>
            <p className={styles.headingTwo}>Invest in erxes</p>
            <h1 className={styles.headingOne}>
              Invest in a more equitable, community-driven, and inclusive
              marketing technology
            </h1>
            <Link
              className="button button--primary"
              to={"https://invest.erxes.io/"}
              target="_blank"
            >
              Invest now
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="container">
          <section className={classnames(styles.section)}>
            <p>
              Our mission is to make marketing technology accessible for
              everyone through our open-source software. We are going to change
              the way businesses grow and deliver breakthrough value to erxes’
              customers.
            </p>
            <p>
              Aside from advocating for the open exchange of information through
              our platform, we put our community members in the heart of our
              business. That’s why we are launching a continuous securities
              offering (CSO) powered by Fairmint Technology. It allows everyone
              in the world to invest in us at any single time by hitting an
              “invest now” button on our website.
            </p>
            <p>
              We always strive to go above and beyond to support the community,
              and we are excited to share this investment opportunity with you.
              Come along on this journey with us!
            </p>
          </section>
          <section className={styles.dedicationWrapper}>
            <div className="container">
              <h2 className={classnames("center-desktop")}>
                What is <span className={styles.colorPrimary}>erxes CSO</span>
              </h2>
              <p>
                erxes Continuous Securities Offering (CSO) is a new way for
                companies to raise funding. The CSO democratizes investing and
                modernizes it for the digital era. The CSO offers several
                advantages over traditional financing:
              </p>
              <InvestCSO />
              <InvestEquity />
              <section className={styles.clientsWrapper}>
                <div className="container">
                  <h2 className={classnames("center-desktop")}>
                    Aligning the Company and&nbsp;
                    <span className={styles.colorPrimary}>Investors</span>
                  </h2>
                  <p>
                    Several features of the erxes CSO are designed to align the
                    investor’s interests with the company’s. One is the pricing
                    model. The model contemplates the security price rising with
                    the number of securities outstanding. This means that
                    investor enthusiasm helps the company raise more capital,
                    given that the company receives capital for each newly
                    minted security. This capital, in turn, helps investors by
                    enabling the company to invest and grow, creating a virtuous
                    circle.
                  </p>
                  <div className={classnames("center-desktop")}>
                    <img src="img/invest-chart2.png" alt="Chart" />
                  </div>
                  <div className="pd-large">
                    <ul className={styles.investList}>
                      <li>
                        <span>1</span>Securities finance the company in exchange
                        for a claim on a reserve funded mainly by company
                        revenues
                      </li>
                      <li>
                        <span>2</span>The company uses financing to invest and
                        grow
                      </li>
                      <li>
                        <span>3</span>Growth boosts the revenues committed to
                        the CSO reserve
                      </li>
                      <li>
                        <span>4</span>The cash in the reserve increases the
                        security’s floor (redemption) price
                      </li>
                      <li>
                        <span>5</span>The rising floor price reduces the risk
                        and increases the security’s worth
                      </li>
                      <li>
                        <span>6</span>Rising revenues and reduced risk should
                        support increased investor confidence, upward price
                        pressure in the company’s security until the company
                        exits the CSO and buys back securities.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <InvestFAQ />
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
