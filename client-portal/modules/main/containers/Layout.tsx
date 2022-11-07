import 'erxes-icon/css/erxes.min.css';

import Head from 'next/head';
import React from 'react';

import AppProvider, { AppConsumer } from '../../appContext';
import { readFile } from '../../common/utils';
import { Store } from '../../types';
import DumbLayout from '../components/Layout';

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
                    href={readFile(config.icon || '/static/favicon.png')}
                    type="image/x-icon"
                  />
                )}
                {config.name && <title>{config.name}</title>}
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
