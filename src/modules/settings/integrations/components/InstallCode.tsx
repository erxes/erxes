import { getEnv } from 'apolloClient';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Info from 'modules/common/components/Info';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IIntegration } from 'modules/settings/integrations/types';
import { MarkdownWrapper } from 'modules/settings/styles';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import { Script } from '../styles';

type Props = {
  integration: IIntegration;
  closeModal: () => void;
  positivButton?: React.ReactNode;
};

type State = {
  basicCode: string;
  singlePageCode: string;
  copied: boolean;
  currentTab: string;
};

const installCodeIncludeScript = type => {
  const { REACT_APP_CDN_HOST } = getEnv();

  return `
    (function() {
      var script = document.createElement('script');
      script.src = "${REACT_APP_CDN_HOST}/build/${type}Widget.bundle.js";
      script.async = true;
      var entry = document.getElementsByTagName('script')[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  `;
};

const getInstallCode = brandCode => {
  return `
    <script>
      window.erxesSettings = {
        messenger: {
          brand_id: "${brandCode}",
        },
      };
      ${installCodeIncludeScript('messenger')}
    </script>
  `;
};

const singlePageInstall = brandCode => {
  const { REACT_APP_CDN_HOST } = getEnv();

  return `
    (window as any).erxesSettings = {
      messenger: {
        brand_id: "${brandCode}",
      },
    };
    
    (() => {
      const script = document.createElement('script');
      script.src = "${REACT_APP_CDN_HOST}/build/messengerWidget.bundle.js";
      script.async = true;

      const entry = document.getElementsByTagName('script')[0] as any;
      entry.parentNode.insertBefore(script, entry);
    })();
  `;
};

class InstallCode extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    let basicCode = '';
    let singlePageCode = '';
    const integration = props.integration || {};

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand || {};

      basicCode = getInstallCode(brand.code);
      singlePageCode = singlePageInstall(brand.code);
    }

    this.state = {
      basicCode,
      singlePageCode,
      currentTab: 'basic',
      copied: false
    };
  }

  onCopy = () => {
    this.setState({ copied: true });
  };

  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  renderContent(currentTab: string) {
    if (currentTab === 'googletag') {
      return (
        <div>
          <b>
            To install erxes on your website with Google Tag Manager, just
            follow these steps.
          </b>
          <ol>
            <li>
              Navigate to the <b>Tags section</b> of your Google Tag Manager
              account
            </li>
            <li>
              Create a <b>new tag</b> and name it (for example: "erxes-chat")
            </li>
            <li>
              Click the Tag Configuration section and choose <b>Custom HTML</b>{' '}
              tag type
            </li>
            <li>Paste the code below </li>
            <li>Next, click the Triggering section and choose “All Pages”</li>
            <li>Click ‘Save’ button in the top-right corner of the page</li>
            <li>
              Next click ‘Submit’ button in the top-right corner of the page to
              save the changes you made
            </li>
            <li>
              Now, erxes chat will be installed using your Google Tag Manager
              account. Just make sure you copy the gtm code to your web.
            </li>
          </ol>
        </div>
      );
    }

    return null;
  }

  renderScript(
    description: string,
    code: string,
    extraContent: boolean,
    currentTab: string
  ) {
    const { copied } = this.state;

    return (
      <Script>
        <Info>
          {__(description)}.{extraContent && this.renderContent(currentTab)}
        </Info>
        <MarkdownWrapper>
          <ReactMarkdown source={code} />
          {code ? (
            <CopyToClipboard text={code} onCopy={this.onCopy}>
              <Button
                size="small"
                btnStyle={copied ? 'primary' : 'success'}
                icon="copy"
              >
                {copied ? 'Copied' : 'Copy to clipboard'}
              </Button>
            </CopyToClipboard>
          ) : (
            <EmptyState icon="copy" text="No copyable code" size="small" />
          )}
        </MarkdownWrapper>
      </Script>
    );
  }

  renderScripts() {
    const { currentTab, basicCode, singlePageCode } = this.state;

    let description;
    let extraContent;
    let script;
    switch (currentTab) {
      case 'basic':
        description =
          'For websites and web apps with full-page refreshes. Paste the code below before the body tag on every page you want erxes chat to appear';
        script = basicCode;
        break;
      case 'single':
        description =
          'For web apps built with asynchronous JavaScript. Paste the code below in main layout you want erxes chat to appear';
        script = singlePageCode;
        break;
      case 'googletag':
        description =
          'To connect Google Tag Manager to erxes, you must have an active Google Tag Manager account with a published container';
        extraContent = true;
        script = basicCode;
        break;
      case 'ios':
        description = 'mail-alt';
        break;
      case 'android':
        description = 'mail-alt';
        break;
      default:
        description = 'doc-text-inv-1';
    }

    return this.renderScript(description, script, extraContent, currentTab);
  }

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'basic' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'basic')}
          >
            {__('Basic JavaScript')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'single' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'single')}
          >
            {__('Single page apps')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'googletag' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'googletag')}
          >
            {__('Google tag manager')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'ios' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'ios')}
          >
            {__('IOS')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'android' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'android')}
          >
            {__('Android')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'react' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'react')}
          >
            {__('React native')}
          </TabTitle>
        </Tabs>

        {this.renderScripts()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Close
          </Button>
          {this.props.positivButton}
        </ModalFooter>
      </>
    );
  }
}

export default InstallCode;
