import React from "react";
import classnames from "classnames";
import styles from "./styles.module.css";

export const InvestCSO = () => {
  return (
    <section>
      <div className="container">
        <div className="row pd-medium">
          <div className={classnames("col col--4")}>
            <div className={styles.item}>
              <img
                className={styles.investIcon}
                src="img/invest-icon.jpg"
                alt="Founders"
              />
              <h4>Founders</h4>
              <p className={styles.smallDesc}>
                Get financing while retaining their ownership stake
              </p>
            </div>
          </div>
          <div className={classnames("col col--4")}>
            <div className={styles.item}>
              <img
                className={styles.investIcon}
                src="img/invest-icon1.jpg"
                alt="Investors"
              />
              <h4>Investors</h4>
              <p className={styles.smallDesc}>Get better liquidity</p>
            </div>
          </div>
          <div className={classnames("col col--4")}>
            <div className={styles.item}>
              <img
                className={styles.investIcon}
                src="img/invest-icon2.jpg"
                alt="Stakeholders"
              />
              <h4>Stakeholders</h4>
              <p className={styles.smallDesc}>
                Get a way to participate in the company’s financial success
              </p>
            </div>
          </div>
        </div>
        <div>
          <p>
            <b>Founders</b> get financing without sacrificing ownership of the
            company. They also get a vehicle to align the company’s wellbeing
            with its stakeholders and customers.
          </p>
          <p>
            <b>Investors</b> get liquidity so that they can buy and sell
            whenever they want within the boundaries set by securities law in
            the applicable jurisdictions.
          </p>
          <p>
            <b>Stakeholders</b> — such as employees and platform users — get
            access to security that lets them participate financially in the
            company’s growth.
          </p>
        </div>
        <div className="row pd-large center-desktop">
          <div className={classnames("col col--6")}>
            <div>
              <h4>Company Value Captured</h4>
              <p className={styles.smallDesc}>
                <b className={styles.colorYellow}>traditional Investment</b>
              </p>
              <img
                className="pd-large"
                src="img/invest-chart.svg"
                alt="Founders"
              />
            </div>
          </div>
          <div className={classnames("col col--6")}>
            <div>
              <h4>Company Value Captured</h4>
              <p className={styles.smallDesc}>
                <b className={styles.colorPrimary}>with erxes CSO</b>
              </p>
              <img src="img/invest-chart1.svg" alt="Investors" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
