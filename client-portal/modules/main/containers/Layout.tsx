import React from "react";
import Head from "next/head";
import DumbLayout from "../components/Layout";
import AppProvider, { AppConsumer } from "../../appContext";
import { Store } from "../../types";
import { readFile } from "../../common/utils";
import "erxes-icon/css/erxes.min.css";

type Props = {
  children: (values: any) => JSX.Element;
  headerBottomComponent?: React.ReactNode;
  headingSpacing?: boolean;
};

const Layout = (props: Props) => {
  return (
    <AppProvider>
      <AppConsumer>
        {({ config, topic, currentUser, ...otherProps }: Store) => {
          const { baseFont } = (config || ({} as any)).styles || {};

          return (
            <>
              <Head>
                {config.icon && (
                  <link
                    rel="shortcut icon"
                    href={readFile(config.icon || "/static/favicon.png")}
                    type="image/x-icon"
                  />
                )}
                {baseFont && (
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                      body {
                        font-family: ${baseFont} !important;
                      }
                  `,
                    }}
                  />
                )}
              </Head>
              <DumbLayout
                {...props}
                {...otherProps}
                config={config}
                currentUser={currentUser}
                topic={topic}
              />
            </>
          );
        }}
      </AppConsumer>
    </AppProvider>
  );
};

export default Layout;
