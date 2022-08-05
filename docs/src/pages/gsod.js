import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";
import Head from "@docusaurus/Head";

export default function Gsod() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { tagline, url, favicon } = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  return (
    <Layout
      title="GSoD"
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
            <p className={styles.headingTwo}>About our organization</p>
            <h1 className={styles.headingOne}>
              Expanding upon the documentation for <br />
              erxes’ 1.0 deployment - erxes
            </h1>
          </div>
        </div>
      </header>
      <main>
        <div className="container">
          <section className={classnames(styles.section)}>
            <p>
              erxes (current version 1.0, first release in 2016) is a free and
              open fair-code licensed experience operating system (XOS). erxes
              started as a Marketing Technology platform, but due to marketing
              being inextricably linked to other aspects of business we have
              decided to expand our scope to include the most valuable aspects
              of ​​an organization, the creation of experiences .The scope of
              our operations have shifted to experience management since our
              launch and is now focused on the experience ecosystem.
            </p>
            <p>
              The current erxes platform is plugin based architecture,
              serverless, and fully cloud compatible to provide all stakeholders
              with the flexibility, scalability, and freedom to achieve the full
              potential of their team.
            </p>
            <p>
              By adopting a serverless and plugin based architecture, erxes
              provides more options for open source developers and agencies. As
              a large part of improving experiences across the board we are
              dedicated to heightening developer experience. One of the largest
              issues that open-source software faces is the complexity and size
              of projects. Using plugins-based architecture and separating the
              core program provides a lower barrier of entry. Thus, developers
              can start out small and scale up as they expand. Our contributors
              are developers and independent agencies that want to step into the
              world of open source development. Our users range from small to
              medium sized companies and enterprises.
            </p>
          </section>
          <section className={styles.dedicationWrapper}>
            <div className="container">
              <h2 className={classnames("center-desktop")}>
                About our <span className={styles.colorPrimary}>project</span>
              </h2>
              <h3 className={classnames("center-desktop")}>
                Our project’s problem
              </h3>
              <p>
                In recent months our development team has been tirelessly
                working on the upcoming release of erxes 1.0. The 1.0 release
                expands upon our platforms greatly and is a shift towards our
                dedication to open source. However, it does introduce
                significant changes to how the project is developed. We have
                fully embraced the need to have a better developer experience
                for open source developers working on the erxes platform. As
                such, improving and expanding on our documentation will benefit
                the developers and agencies that wish to step into the world of
                open source development.
              </p>
              <h3 className={classnames("center-desktop")}>
                Our project’s scope
              </h3>
              <p>
                The erxes 1.0 project will: <br />
                <br />
                <ul>
                  <li>
                    Audit the existing documentation to determine what is still
                    relevant and what needs to be adjusted to meet the developer
                    experience of our 1.0 version launch.{" "}
                  </li>
                  <li>
                    Collaborate with our support team to evaluate and create new
                    guidance materials that will provide guidance for developers
                    regarding our new version.
                  </li>
                  <li>
                    Develop a streamlined documentation architecture to improve
                    developer experience
                  </li>
                  <li>
                    Create a plugin development guide for new developers
                    starting out in open source development for enterprise
                    software.
                  </li>
                  <li>
                    Expand on documentation in regards to the most common issues
                    reported in support tickets.
                  </li>
                  <li>
                    Work with the support teams to create a standardized process
                    for documentation going forward to streamline the
                    documentation process.{" "}
                  </li>
                </ul>
              </p>
              <p>
                Work that is out-of-scope for this project: <br />
                <br />
                <ul>
                  <li>
                    This project will not delve into the SaaS and Enterprise
                    parts of our platform and will only produce documentation
                    that will assist open source developers.
                  </li>
                </ul>
              </p>
              <p>
                It will take approximately four months to complete this part of
                the project. We are actively seeking technical writers to head
                the project and the support teams for the writer are already in
                place. Our product development and writing teams are fully
                backing this project and will act as support personnel for the
                writer.
              </p>
              <h3 className={classnames("center-desktop")}>
                Measuring our project&rsquo;s success
              </h3>
              <p>
                We are looking to increase the overall number of developers
                contributing to our documentation. We are of the opinion that
                structured and streamlined documentation will increase the
                number of new developers contributing plugins to the
                marketplace.
              </p>
              <p>
                We will be tracking both the number of new contributors and the
                number of new plugins on a quarterly basis.
              </p>
              <p>The project can be considered successful when:</p>
              <ul>
                <li aria-level="1">
                  The number of new contributors increases by 10%
                </li>
                <li aria-level="1">
                  The number of plugins by open source developers increases by
                  20%
                </li>
              </ul>
              <h3 className={classnames("center-desktop")}>Timeline</h3>
              <p>
                We estimate that it will take 6 months to complete the project.
                The tech writer will have to go through orientation and an
                introduction to our values and messaging framework. Once that is
                complete we can move on to auditing and updating our
                documentation.
              </p>
              <table>
                <tbody>
                  <tr>
                    <td rowspan="2">
                      <p>
                        <b>Action Items</b>
                      </p>
                    </td>
                    <td colspan="3">
                      <p>
                        <b>Q2</b>
                      </p>
                    </td>
                    <td colspan="3">
                      <p>
                        <b>Q3</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>Q4</b>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>M</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>J</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>J</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>A</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>S</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>O</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>N</b>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>Action Item 1: Orientation</b>
                      </p>
                    </td>
                    <td style={{ background: "#555" }}></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>
                          Action Item 2: Audit existing documentation and create
                          friction log
                        </b>
                      </p>
                    </td>
                    <td></td>
                    <td style={{ background: "#555" }}></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>
                          Action Item 3:Use the friction log to collaborate with
                          our support team to create new guidance materials that
                          will provide guidance for developers regarding our new
                          version.
                        </b>
                      </p>
                    </td>
                    <td></td>
                    <td></td>
                    <td style={{ background: "#555" }}></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>
                          Action Item 4: Develop a streamlined documentation
                          architecture to improve developer experience (DX)
                        </b>
                      </p>
                    </td>
                    <td></td>
                    <td></td>
                    <td style={{ background: "#555" }}></td>
                    <td style={{ background: "#555" }}></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>
                          Action Item 5: Create a plugin development guide for
                          new developers starting out in open source development
                          for enterprise software.
                        </b>
                      </p>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{ background: "#555" }}></td>
                    <td style={{ background: "#555" }}></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>
                          Action Item 6: Expand on documentation in regards to
                          the most common issues reported in support tickets.
                        </b>
                      </p>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{ background: "#555" }}></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <b>
                          Action Item 7: Work with the support teams to create a
                          standardized process for documentation going forward
                          to streamline the documentation process.&nbsp;
                        </b>
                      </p>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{ background: "#555" }}></td>
                    <td style={{ background: "#555" }}></td>
                  </tr>
                </tbody>
              </table>

              <h3 className={classnames("center-desktop")}>
                Project <span className={styles.colorPrimary}>budget</span>
              </h3>
              <h4 className={classnames("center-desktop")}>
                erxes 1.0 project budget
              </h4>

              <table>
                <tbody>
                  <tr>
                    <td>
                      <p>
                        <b>Budget item</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>Amount</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>Running Total</b>
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>Notes/justifications</b>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>
                          Technical writer audit, expansion, update, and release
                          of documentation for erxes 1.0
                        </span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>10000.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>10000.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>
                          This will be a significant undertaking and the writer
                          will have to be fairly compensated&nbsp;
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Volunteer stipends</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>500.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>12000.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>
                          4 volunteer stipends x 500 each, volunteers will be
                          needed to lessen the workload for the writer
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Design work for documentation site&nbsp;</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>300.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>12300.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>
                          The designer will work to align the documentation site
                          with our brand guidelines and to increase ease of
                          navigation
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>erxes swag&nbsp;</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>100.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>12400.00</span>
                      </p>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>Pizza party</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>100.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>12500.00</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span>
                          Throw the support team a pizza party for their
                          contributions to the documentation process&nbsp;
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <span>TOTAL</span>
                      </p>
                    </td>
                    <td></td>
                    <td>
                      <p>
                        <span>12500.00</span>
                      </p>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <h3 className={classnames("center-desktop")}>
                Additional{" "}
                <span className={styles.colorPrimary}>information</span>
              </h3>
              <p style={{ marginBottom: "50px" }}>
                Our marketing team includes 2 marketing copywriters, one of whom
                will assist the technical writer and work as our liaison. As
                they are the person that produced the messaging framework we
                believe that they can bring the technical writer up to speed the
                fastest regarding our messaging and positioning.{" "}
              </p>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
