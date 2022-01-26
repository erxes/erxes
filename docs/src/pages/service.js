import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import styled from "styled-components";

export default function Service() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { tagline, url, favicon } = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  return (
    <Layout
      title="Service in erxes"
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
            <p className={styles.headingTwo}>Service in erxes</p>
            <h1 className={styles.headingOne}>
              Get started with erxes Open-source marketing platform and start earning today!
            </h1>
            <p className={styles.description}>Open fair-code licensed all-in-one growth marketing & management software.</p>
            <Link
              className="button button--primary"
              to={"https://invest.erxes.io/"}
              target="_blank"
            >
              Request consultation
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="container">
          <section>
          <div className={`row pd-medium ${styles.flexCenter}`}>
                <div className={classnames("col col--6")}>
            <div className={styles.serviceBanner}>
              <img
                src="img/service_cover.png"
                alt="Service cover"
              />
              </div>
              </div>
              <div className={classnames("col col--6")}>
              <div className="container">
              <h2 className={classnames("center-desktop")}>
              Scales With <span className={styles.colorPrimary}>your Budget</span>
              </h2>
              <p>
              One of the major benefits of open source software is that acquisition and deployment costs are generally much lower as you are not obliged to pay licensing fees. 
              Cutting costs is extremely important to start-up and smaller companies as the budget that would have been spent on software licensing can be utilized where it is needed. 
              </p>
              <p>For those that are utilizing open source software and wish to expand and scale up it is possible to move from the community version to the commercial version. This means that companies and organizations can test alternatives and pick and choose the one that suits their needs before having to spend any money on licensing. 
              </p>
              </div>
              </div>

              <div className="row pd-medium">
                <div className={classnames("col col--4")}>
                  <div className={styles.serviceItem}>
                    <img
                      className={styles.serviceIcon}
                      src="img/s3.png"
                      alt="Founders"
                    />
                    <h4>Community based</h4>
                    <p className={styles.smallDesc}>
                      Open source projects are often community driven and rely on the collective to progress their development. As these projects are supported by a large group of developers and supporters the speed of development can be quicker than proprietary software. <br /> <br /> The number of people involved can provide extensive testing and troubleshooting. Such projects can often have thousands of developers working on it concurrently, whereas only the largest proprietary project can match this. 
                    </p>
                  </div>
                </div>
                <div className={classnames("col col--4")}>
                  <div className={styles.serviceItem}>
                    <img
                      className={styles.serviceIcon}
                      src="img/s2.png"
                      alt="Investors"
                    />
                    <h4>Reliable and secure</h4>
                    <p className={styles.smallDesc}>
                Security and reliability walk hand in hand with the community of developers supporting the project. Unlike proprietary software, anybody can review crowdsourced software and close gaps in security. <br /> <br />  The community as a whole review the code and are constantly testing to ensure that the software is as reliable as possible.
              </p>
                  </div>
                </div>
                <div className={classnames("col col--4")}>
                  <div className={styles.serviceItem}>
                    <img
                      className={styles.serviceIcon}
                      src="img/s1.png"
                      alt="Stakeholders"
                    />
                    <h4>Trust and transparency</h4>
                    <p className={styles.smallDesc}>
              Open source projects are by nature transparent so as to further development. <br /> <br />  This nature allows developers from around the world to work on the project and increase it’s security thereby increasing the trust that people have for the project. 
              </p>
                  </div>
                </div>
              </div>
              </div>
          </section>
          <section className="pd-medium"> 
          <h2 className={classnames("center-desktop")}>
          Open Fair-Code <span className={styles.colorPrimary}>Source Charges</span>
              </h2>
              <p>
                <span>Our open source methodology means that the public is free to use our code and can be customized to your unique needs. The public (individuals and companies) can use our open source code for free </span>
                <strong>privately</strong>
                <span>. If you would like our team for guidance on customizing and implementing the codes, we deliver the following services:</span>
              </p>
              <div className={styles.servicePrice}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <p>
                        <strong>Services</strong>
                      </p>
                    </td>
                    <td>
                      <p>
                        <strong>Charges</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Deployment Service</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>$200</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Integrations</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>$150 each</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Monthly Maintenance&nbsp;&nbsp;</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>$39/month</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Theme</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>$5/month</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Setup Services (Import, Webhook, etc)</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>$50 each</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Onboarding session</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>$50</span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                <span>Please </span>
                <a href="https://help.erxes.io/help/knowledge-base/article/detail?catId=ogZPWFSy78Anc5Ras&amp;_id=s8ny8SmarS3MfA25p">
                  <span>read our knowledgebase article on how to purchase add-ons for open-source users step by step</span>
                </a>
              </p>
              </div>
          </section>
          <section className="pd-large"> 
          <h2 className={classnames("center-desktop")}>
          Commercialization 
              </h2>
              <p>
              The public is free to use our code for free for themselves, however if being used for profits, more steps apply. If you plan to commercialize the use of the code, you may need to notify us beforehand. Depending on the revenue level your team has, restrictions may apply and a license may be required.
              </p>
              <p>
              If your revenue from services based on erxes is more than this threshold, we invite you to become a partner agency and apply for a license. If you plan to host erxes, you will need request permission under the Commons Clause
              </p>
              <p>
              Once prior permissions and official agreements have been completed, you are free to use our code to make unlimited profit. Click <a href="https://github.com/erxes/erxes" target="_blank">here</a> to read more about and access our code.
              </p>
              <p>
              If you have any questions or if the above restrictions apply to your case, please reach out to us at <a href="mailto:info@erxes.io">info@erxes.io</a>. 
              </p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
