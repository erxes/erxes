import React from "react";
import classnames from "classnames";
import styles from "./styles.module.css";

export const InvestFAQ = () => {
  return (
    <section className={styles.clientsWrapper}>
      <div className="container">
        <h2 className={classnames("center-desktop")}>
          Frequently asked questions{" "}
          <span className={styles.colorPrimary}>(FAQ)</span>
        </h2>
        <div>
          <dl className={styles.descriptionList}>
            <dt>
              <b>What is erxes CSO?</b>
            </dt>
            <dd>
              erxes Continuous Securities Offering (CSO) is a new way for
              companies to raise funding. The CSO democratizes investing and
              modernizes it for the digital era. It expands the pool of
              potential investors, allowing all stakeholders — not just a small
              group of privileged, wealthy investors — to share in the value
              created by a company’s success.
            </dd>
          </dl>
          <dl className={styles.descriptionList}>
            <dt>
              <b>Who can invest?</b>
            </dt>
            <dd>
              This investment opportunity is open to everyone around the world.
              Please note that if you’re a US citizen or entity, you must be an
              accredited investor.
            </dd>
          </dl>
          <dl className={styles.descriptionList}>
            <dt>
              <b>What is the minimum amount I can invest in?</b>
            </dt>
            <dd>
              {" "}
              You can start investing with $300. Note that this amount will
              increase in the future.
            </dd>
          </dl>
          <dl className={styles.descriptionList}>
            <dt>
              <b>When can I invest?</b>
            </dt>
            <dd>The CSO launch date is Nov 23, 2020 at 08:00 PM PST. </dd>
          </dl>
          <dl className={styles.descriptionList}>
            <dt>
              <b>When can I start selling or transferring my $ERXS?</b>
            </dt>
            <dd>
              Your purchased $ERXS can only be sold or transferred after 12
              months.
            </dd>
          </dl>
          <dl className={styles.descriptionList}>
            <dt>
              <b>Where can I see the offering data?</b>
            </dt>
            <dd>
              Contrary to other offerings, it is available through our own
              website. Please visit&nbsp;
              <a href="https://invest.erxes.io" target="_blank">
                https://invest.erxes.io
              </a>
            </dd>
          </dl>
          <dl className={styles.descriptionList}>
            <dt>
              <b>What’s the initial price of $ERXS?</b>
            </dt>
            <dd>
              $ERXS starts at $1.83. The price of ERXS will evolve with the
              demand for $ERXS.
            </dd>
          </dl>
          <dl className={styles.descriptionList}>
            <dt>
              <b>What is different about CSO compared to other offerings?</b>
            </dt>
            <dd>
              Based on state-of-the-art research in economics & finance, erxes’
              continuous security offering (CSO) is powered by Fairmint
              Technology and is the first one of its kind. It falls somewhere
              between an initial coin offering (ICO) and an initial public
              offering (IPO) and offers the advantages of each without the
              downsides.
            </dd>
          </dl>
        </div>
      </div>
    </section>
  );
};
