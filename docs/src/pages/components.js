import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import SideMenu, { menuItems } from "../components/SideMenu";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Buttons from "../components/pages/buttons";
import Infos from "../components/pages/info";

// const Button = () => <h1>Erxes</h1>;

export default function Components() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { tagline, url, favicon } = siteConfig;

  const ogImage = `${url}/img/default.jpg`;

  // const [inactive, setInactive] = useState(false);

  return (
    <Layout
      title="Components"
      description={tagline}
      ogImage={ogImage}
      url={url}
      favicon={favicon}
    >
      <Head>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
      </Head>
      {/* <header
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
      </header> */}
      <main>
        <div className={styles.componentsContainer}>
            <Router>
              <SideMenu />

              {/* <div className={`container ${inactive ? "inactive" : ""}`}>
                {menuItems.map((menu, index) => (
                  <>
                    <Route key={menu.name} exact={menu.exact} path={menu.to}>
                      <h1>{menu.name}</h1>
                    </Route>
                  </>
                ))}
              </div> */}
              <div className={styles.page}>
                <Switch>
                  <Route path={'/components/buttons'}>
                    <Buttons />
                  </Route>
                  
                  <Route path={'/components/info'}>
                    <Infos />
                  </Route>
                </Switch>
              </div>
              
            </Router>
        </div>
      </main>
    </Layout>
  );
}
