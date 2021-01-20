import React from "react";
import classnames from "classnames";
import styles from "./styles.module.css";

export const InvestEquity = () => {
  return (
    <section className="pd-large">
      <div className="container">
        <h2 className={classnames("center-desktop")}>
          Solving the{" "}
          <span className={styles.colorPrimary}>Equity Inequity</span>
        </h2>
        <div>
          <p>
            It’s not groundbreaking news that technologies developed over the
            past quarter-century have dramatically reshaped how businesses
            operate and how they interact with customers. These technologies —
            ranging from the internet and smartphone apps to cloud computing and
            blockchain — have enabled new business models, such as peer-to-peer
            lending (Lending Club and Prosper) and sharing-economy platforms
            (Airbnb and Lyft).
          </p>
          <p>
            As these models have evolved, high profile investors have lamented
            the growing inadequacies of the investment vehicles that have
            underpinned the economy since the industrial revolution. While these
            vehicles have undoubtedly helped drive centuries of growth and
            innovation, they tend to serve the interests of a privileged few —
            wealthy shareholders over stakeholders.
          </p>
          <p>
            Companies wanted to reward or incentivize their stakeholders by
            offering a stake in their future success. But there currently exists
            no vehicle for them to do so. Pre-IPO companies frequently sell
            shares to their employees as a retention perk, but securities
            regulations prevent them from offering shares to many outside
            stakeholders. By the time a company launches its initial public
            stock offerings (IPO), it’s too late for these early stakeholders —
            who frequently believed in the company enough to alter their careers
            and make investments (cars, apartments) — to cash in on the
            substantial value that they helped create in the high growth stages
            of development.
          </p>
          <p>
            Moreover, even IPOs are increasingly out of the reach of
            stakeholders. Companies are waiting longer to go public, and many
            more are choosing to remain private, largely due to the growing
            administrative and regulatory burden. There are about half as many
            public companies today (3,671) as in 1996 (7,322). If a company
            doesn’t go public, sell itself, or distribute dividends, its
            financial value remains perpetually in the hands of a few.
            Stakeholders never get their fair share.
          </p>
        </div>
        <div className={classnames("center-desktop")}>
          <div>
            <h4 className="pd-large">
              When you can invest as a{" "}
              <span className={styles.colorYellow}>Traditional business</span>{" "}
              angel
            </h4>
            <img src="img/graph.svg" alt="Founders" />
          </div>
          <div className="pd-large">
            <h4 className="pd-large">
              When you can invest as a business angel{" "}
              <span className={styles.colorPrimary}>With erxes cso</span>
            </h4>
            <img src="img/graph1.svg" alt="Investors" />
          </div>
        </div>
      </div>
    </section>
  );
};
