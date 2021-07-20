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

export default function Components() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;
    const { tagline, url, favicon } = siteConfig;

    const ogImage = `${url}/img/default.jpg`;

    return (
        <div>
            <Layout
                title="Components Overview"
                description={tagline}
                ogImage={ogImage}
                url={url}
                favicon={favicon}
            >
                <Head>
                    <script async defer src="https://buttons.github.io/buttons.js"></script>
                </Head>
                <div className={styles.bigContainer}>

                    <main>
                        <div className="container">
                            <div className={styles.header}>
                                <h1 className={styles.headingOne}>
                                    Info
                                </h1>
                            </div>
                            <div className={styles.overviewMessage}>
                                Provide contextual feedback messages for typical user actions with the handful of available and flexible alert messages.
                            </div>


                            <div className={styles.overviewBox}>

                                <div className={styles.infoNoBorderPrimary}>
                                    <div className={styles.infoPrimaryContent}>
                                        Primary Alert
                                    </div>
                                </div>
                                <div className={styles.infoNoBorderWarning}>
                                    <div className={styles.infoWarningContent}>
                                        Warning Alert
                                    </div>
                                </div>
                                <div className={styles.infoNoBorderDanger}>
                                    <div className={styles.infoDangerContent}>
                                        Danger Alert
                                    </div>
                                </div>
                                <div className={styles.infoNoBorderInfo}>
                                    <div className={styles.infoInfoContent}>
                                        Info Alert
                                    </div>
                                </div>
                                <div className={styles.infoNoBorderSuccess}>
                                    <div className={styles.infoSuccessContent}>
                                        Success Alert
                                    </div>
                                </div>

                            </div>
                            <div className={styles.codeBox}>
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'primary'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Primary Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'warning'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Warning Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'danger'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Danger Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'info'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Info Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'success'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Success Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                            </div>

                            <div className={styles.subHeader}>
                                With bordered
                            </div>

                            <div className={styles.overviewBox}>

                                <div className={styles.infoPrimary}>
                                    <div className={styles.infoPrimaryContent}>
                                        Primary Alert
                                    </div>
                                </div>
                                <div className={styles.infoWarning}>
                                    <div className={styles.infoWarningContent}>
                                        Warning Alert
                                    </div>
                                </div>
                                <div className={styles.infoDanger}>
                                    <div className={styles.infoDangerContent}>
                                        Danger Alert
                                    </div>
                                </div>
                                <div className={styles.infoInfo}>
                                    <div className={styles.infoInfoContent}>
                                        Info Alert
                                    </div>
                                </div>
                                <div className={styles.infoSuccess}>
                                    <div className={styles.infoSuccessContent}>
                                        Success Alert
                                    </div>
                                </div>

                            </div>
                            <div className={styles.codeBox}>
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'primary'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Primary Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'warning'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Warning Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'danger'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Danger Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'info'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Info Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'success'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Success Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                            </div>

                            <div className={styles.subHeader}>
                                With Title
                            </div>

                            <div className={styles.overviewBox}>

                                <div className={styles.infoPrimary}>
                                    <div className={styles.infoPrimaryContent}>
                                        <div className={styles.infoPrimaryTitle}>Title</div>
                                        Primary Alert
                                    </div>
                                </div>
                                <div className={styles.infoWarning}>
                                    <div className={styles.infoWarningContent}>
                                        <div className={styles.infoWarningTitle}>Title</div>
                                        Warning Alert
                                    </div>
                                </div>
                                <div className={styles.infoDanger}>
                                    <div className={styles.infoDangerContent}>
                                        <div className={styles.infoDangerTitle}>Title</div>
                                        Danger Alert
                                    </div>
                                </div>
                                <div className={styles.infoInfo}>
                                    <div className={styles.infoInfoContent}>
                                        <div className={styles.infoInfoTitle}>Title</div>
                                        Info Alert
                                    </div>
                                </div>
                                <div className={styles.infoSuccess}>
                                    <div className={styles.infoSuccessContent}>
                                        <div className={styles.infoSuccessTitle}>Title</div>
                                        Success Alert
                                    </div>
                                </div>

                            </div>
                            <div className={styles.codeBox}>
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'primary'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` title=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'Title'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Primary Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'warning'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` title=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'Title'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Warning Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'danger'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` title=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'Title'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Danger Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'info'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` title=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'Title'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Info Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                                <br />
                                <span style={{ color: '#2f6f9f' }}>{'<Info'}</span>
                                <span style={{ color: '#4f9fcf' }}>{` type=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'success'}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` bordered=`}</span>
                                <span style={{ color: '#d44950' }}>{`{true}`}</span>
                                <span style={{ color: '#4f9fcf' }}>{` title=`}</span>
                                <span style={{ color: '#d44950' }}>{`{'Title'}`}</span>
                                <span style={{ color: '#2f6f9f' }}>{'>'}</span><br />
                                Success Alert<br />
                                <span style={{ color: '#2f6f9f' }}>{'</Info>'}</span>
                            </div>

                        </div>
                    </main>
                </div>
            </Layout>
        </div>
    );
}