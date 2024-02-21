import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { __, getEnv } from 'modules/common/utils';

import Button from 'modules/common/components/Button';
import CopyToClipboard from 'react-copy-to-clipboard';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import Info from '@erxes/ui/src/components/Info';
import { MarkdownWrapper } from '@erxes/ui-settings/src/styles';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Script,
  FlexStartHeader,
  ScriptWrapper,
} from 'modules/saas/onBoarding/styles';

type Props = {
  integration: IIntegration;
};

type State = {
  basicCode: string;
  singlePageCode: string;
  copied: boolean;
  singleCopied: boolean;
  contentCopied: boolean;
  currentTab: string;
};

const installCodeIncludeScript = (type) => {
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

const getInstallCode = (brandCode) => {
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

const singlePageInstall = (brandCode) => {
  const { REACT_APP_CDN_HOST } = getEnv();

  return `
    window.erxesSettings = {
      messenger: {
        brand_id: "${brandCode}",
      },
    };
    
    (() => {
      const script = document.createElement('script');
      script.src = "${REACT_APP_CDN_HOST}/build/messengerWidget.bundle.js";
      script.async = true;

      const entry = document.getElementsByTagName('script')[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  `;
};

class InstallCode extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    let basicCode = '';
    let singlePageCode = '';
    const integration = props.integration || ({} as IIntegration);

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand || ({} as IBrand);

      basicCode = getInstallCode(brand.code);
      singlePageCode = singlePageInstall(brand.code);
    }

    this.state = {
      basicCode,
      singlePageCode,
      currentTab: 'basic',
      copied: false,
      singleCopied: false,
      contentCopied: false,
    };
  }

  onCopy = (currentTab: string) => {
    if (currentTab === 'basic') {
      return this.setState({ copied: true });
    }

    if (currentTab === 'single') {
      return this.setState({ singleCopied: true });
    }

    return this.setState({ contentCopied: true });
  };

  onSimulate = () => {
    const { REACT_APP_CDN_HOST } = getEnv();
    const brand = this.props.integration.brand || ({} as IBrand);

    window.open(
      `${REACT_APP_CDN_HOST}/test?type=messenger&brand_id=${brand.code}`,
      'messengerWindow',
      'width=800,height=800',
    );
  };

  onTabClick = (currentTab) => {
    this.setState({ currentTab });
  };

  renderDescription(currentTab: string) {
    if (currentTab === 'googletag') {
      const items = Array.from(Array(8).keys());

      const renderList = (index: number) => {
        return (
          <li key={index}>
            <div dangerouslySetInnerHTML={{ __html: __(`gtm_li_${index}`) }} />
          </li>
        );
      };

      return (
        <div>
          <b>{__('gtm_b')}</b>
          <ol>{items.map((item) => renderList(item + 1))}</ol>
        </div>
      );
    }

    return null;
  }

  renderScript(code: string, action: boolean, currentTab: string) {
    if (!code) {
      return null;
    }

    return (
      <MarkdownWrapper>
        <ReactMarkdown children={code} />
        {code ? (
          <CopyToClipboard
            text={code}
            onCopy={this.onCopy.bind(this, currentTab)}
          >
            <Button btnStyle={action ? 'primary' : 'success'} icon="copy-1">
              {action ? 'Copied' : 'Copy to clipboard'}
            </Button>
          </CopyToClipboard>
        ) : (
          <EmptyState icon="copy" text="No copyable code" size="small" />
        )}
      </MarkdownWrapper>
    );
  }

  renderContent(
    description: string,
    code: string,
    extraContent: boolean,
    currentTab: string,
    action: boolean,
  ) {
    return (
      <Script>
        <Info>
          {__(description)}
          {extraContent && this.renderDescription(currentTab)}
        </Info>
        {this.renderScript(code, action, currentTab)}
      </Script>
    );
  }

  renderContents() {
    const {
      currentTab,
      basicCode,
      singlePageCode,
      copied,
      singleCopied,
      contentCopied,
    } = this.state;

    let description;
    let extraContent;
    let script;
    let action;
    switch (currentTab) {
      case 'basic':
        description = __(
          'Paste the following code before the body tag on every page you want erxes widget to appear',
        );
        script = basicCode;
        action = copied;
        break;
      case 'single':
        description = __(
          'For web apps built with asynchronous JavaScript. Paste the code below in main layout you want erxes chat to appear',
        );
        script = singlePageCode;
        action = singleCopied;
        break;
      case 'googletag':
        description = __(
          'To connect Google Tag Manager to erxes, you must have an active Google Tag Manager account with a published container',
        );
        extraContent = true;
        script = basicCode;
        action = contentCopied;
        break;
      default:
        extraContent = true;
    }

    return this.renderContent(
      description,
      script,
      extraContent,
      currentTab,
      action,
    );
  }

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <FlexStartHeader>
          <h2>Install Erxes Messenger</h2>
          <p>
            Use the script code to activate erxes messenger, simply copy the
            code below and paste it into your website's code just before closing
            the body tag. 
          </p>
        </FlexStartHeader>
        <ScriptWrapper>
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
          </Tabs>

          {this.renderContents()}
        </ScriptWrapper>
      </>
    );
  }
}

export default InstallCode;
