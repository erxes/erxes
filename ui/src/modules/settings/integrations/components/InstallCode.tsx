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
  swift: string;
  objc: string;
  android: string;
  copied: boolean;
  singleCopied: boolean;
  contentCopied: boolean;
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

const swiftSdkInstall = brandCode => {
  const { REACT_APP_API_URL } = getEnv();
  return `Erxes.setup(erxesApiUrl: "${REACT_APP_API_URL}", brandId: "${brandCode}")`;
};

const objcSdkInstall = brandCode => {
  const { REACT_APP_API_URL } = getEnv();
  return `[Erxes setupWithErxesApiUrl:@"${REACT_APP_API_URL}" brandId:@"${brandCode}"];`;
};

const objectiveSDK = `target '<Your Target Name>' do
use_frameworks!
pod 'ErxesSDK'


end
pre_install do |installer|
  installer.analysis_result.specifications.each do |s|
    s.swift_version = '4.2' unless s.swift_version
  end
end
`;

const iosSDK = `target {'<Your Target Name>'} do
  pod 'ErxesSDK'
end`;

const withUserData = `var data = [String : Any]()
    data["key"] = "value"
    data["another key"] = "another value"
  Erxes.start(data: data)`;

const withUserDataObjective = `NSDictionary *data = @{ @"key" : @"value", @"another key" : @"another value"};

[Erxes startWithData:data];`;

const buildgradle = `allprojects {
    repositories {
        ...
        maven { url 'https://jitpack.io' }
    }
  }`;

const dependency = `dependencies {
    implementation 'com.github.erxes:erxes-android-sdk:{latest_release}'
  }`;

const androidSdkInstall = brandCode => {
  const { REACT_APP_API_URL, REACT_APP_API_SUBSCRIPTION_URL } = getEnv();

  return `public class CustomActivity extends AppCompatActivity {
      Config config;
      @Override
      protected void onCreate(Bundle savedInstanceState) {
          config = new Config.Builder("${brandCode}")
                  .setApiHost("https://${REACT_APP_API_URL}/graphql")
                  .setSubscriptionHost("${REACT_APP_API_SUBSCRIPTION_URL}")
                  .setUploadHost("https://${REACT_APP_API_URL}/upload-file")
                  .build(this);
      }
    }`;
};

const loginChat = `public void onClick(View view) {
  config.Start();
}`;

const startChat = `public void onClick(View view) {
  JSONObject customData = new JSONObject();
  customData.put("firstName","itgel");
  customData.put("lastName","galt");
  config.start(email: "info@erxes.co", phone: "88998899", data: customData)
}`;

class InstallCode extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    let basicCode = '';
    let singlePageCode = '';
    let swift = '';
    let objc = '';
    let android = '';
    const integration = props.integration || {};

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand || {};

      basicCode = getInstallCode(brand.code);
      singlePageCode = singlePageInstall(brand.code);
      swift = swiftSdkInstall(brand.code);
      objc = objcSdkInstall(brand.code);
      android = androidSdkInstall(brand.code);
    }

    this.state = {
      basicCode,
      swift,
      singlePageCode,
      objc,
      android,
      currentTab: 'basic',
      copied: false,
      singleCopied: false,
      contentCopied: false
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

  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  renderDescription(currentTab: string) {
    if (currentTab === 'googletag') {
      return (
        <div>
          <b>{__('gtm_b')}</b>
          <ol>
            <li>{__('gtm_li_1')}</li>
            <li>{__('gtm_li_2')}</li>
            <li>{__('gtm_li_3')}</li>
            <li>{__('gtm_li_4')}</li>
            <li>{__('gtm_li_5')}</li>
            <li>{__('gtm_li_6')}</li>
            <li>{__('gtm_li_7')}</li>
            <li>{__('gtm_li_8')}</li>
          </ol>
        </div>
      );
    }

    if (currentTab === 'ios') {
      return (
        <>
          <h4>
            <b>Swift</b>
          </h4>
          <ol>
            <li>
              {__('Add Erxes SDK to your iOS project in Xcode:')}
              <MarkdownWrapper>
                <pre>{iosSDK}</pre>
              </MarkdownWrapper>
              {__('then run')} <b>{__(' pod install ')}</b>
              {__('in terminal')}
            </li>
            <li>
              {__(
                `Add a 'Privacy - Photo Library Usage Description' entry to your`
              ) + ' Info.plist.'}
              <a href="https://developer.apple.com/library/content/qa/qa1937/_index.html">
                {' '}
                {__('This is required by Apple')}{' '}
              </a>
              {__('and gives your users permission to upload images')}.
            </li>
            <li>
              {__(
                'Import ErxesSDK into AppDelegate.swift then paste the following code into'
              )}{' '}
              {<b>didFinishLaunchingWithOptions {__('method:')}</b>}
              <br />
              <br />
              <MarkdownWrapper>
                <pre>{this.state.swift}</pre>
              </MarkdownWrapper>
            </li>
            <li>
              {__(
                'Import ErxesSDK into your UIViewController class and you can start Erxes with following options:'
              )}{' '}
              <br />
              <ol type="a">
                <li>
                  <b>{__('Without user data')}</b>
                  <MarkdownWrapper>
                    <pre>Erxes.start()</pre>
                  </MarkdownWrapper>
                </li>
                <li>
                  <b>{__('With user data')}</b>
                  <MarkdownWrapper>
                    <pre>{withUserData}</pre>
                  </MarkdownWrapper>
                </li>
              </ol>
            </li>
          </ol>
          <br />
          <h4>
            <b>Objective-C</b>
          </h4>
          <ol>
            <li>
              {__('Add Erxes SDK to your iOS project in Xcode:')}
              <MarkdownWrapper>
                <pre>{objectiveSDK}</pre>
              </MarkdownWrapper>
            </li>
            <li>
              {__(
                `Add a 'Privacy - Photo Library Usage Description' entry to your`
              ) + ' Info.plist.'}
              <a href="https://developer.apple.com/library/content/qa/qa1937/_index.html">
                {' '}
                {__('This is required by Apple')}{' '}
              </a>
              {__('and gives your users permission to upload images')}.
            </li>
            <li>
              {`#import <ErxesSDK/ErxesSDK-Swift.h> into`} AppDelegate.swift
              {__('then paste the following code into')}{' '}
              <b>didFinishLaunchingWithOptions method:</b>
              <br />
              <br />
              <MarkdownWrapper>
                <pre>{this.state.objc}</pre>
              </MarkdownWrapper>
            </li>
            <li>
              {`#import <ErxesSDK/ErxesSDK-Swift.h>`} {__('into your')}
              UIViewController.m{' '}
              {__('class and you can start Erxes with following options:')}{' '}
              <br />
              <ol type="a">
                <li>
                  <b>{__('Without user data')}</b>
                  <MarkdownWrapper>
                    <pre>[Erxes startWithData:nil];</pre>
                  </MarkdownWrapper>
                </li>
                <li>
                  <b>{__('With user data')}</b>
                  <MarkdownWrapper>
                    <pre>{withUserDataObjective}</pre>
                  </MarkdownWrapper>
                </li>
              </ol>
            </li>
          </ol>
        </>
      );
    }

    if (currentTab === 'android') {
      return (
        <ol>
          <li>
            <b> {__('Add the JitPack repository to your build file')} </b>{' '}
            <br />
            {__('Add it in your root')} {'build.gradle'}{' '}
            {__('at the end of repositories:')}
            <MarkdownWrapper>
              <pre>{buildgradle}</pre>
            </MarkdownWrapper>
          </li>
          <li>
            <b>{__('Add the dependency')}</b> <br />
            <MarkdownWrapper>
              <pre>{dependency}</pre>
            </MarkdownWrapper>
          </li>
          <li>
            <b>{__('Default configuration')}</b> <br />
            <b>* brandCode</b> - {__('generated unique code of your brand')}{' '}
            <br />
            <b>* apiHost</b> - {__('erxes-widgets-api server url')} <br />
            <b>* subsHost</b> - {__('erxes-api subscription url')} <br />
            <b>* uploadUrl</b> - {__('erxes-api server url')}
            <MarkdownWrapper>
              <pre>{this.state.android}</pre>
            </MarkdownWrapper>
          </li>
          <li>
            <b>{__('Start chat')}</b> <br />
            {__('Call a chat with login form')}
            <MarkdownWrapper>
              <pre>{loginChat}</pre>
            </MarkdownWrapper>
          </li>
          <li>
            <b>{__('Start chat')}</b> <br />
            {__(
              'If your application has already registered with user , give user’s information with this way'
            )}{' '}
            <br />
            <MarkdownWrapper>
              <pre>{startChat}</pre>
            </MarkdownWrapper>
          </li>
        </ol>
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
        <ReactMarkdown source={code} />
        {code ? (
          <CopyToClipboard
            text={code}
            onCopy={this.onCopy.bind(this, currentTab)}
          >
            <Button
              uppercase={false}
              btnStyle={action ? 'primary' : 'success'}
              icon="copy-1"
            >
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
    action: boolean
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
      contentCopied
    } = this.state;

    let description;
    let extraContent;
    let script;
    let action;
    switch (currentTab) {
      case 'basic':
        description = __(
          'Paste the following code before the body tag on every page you want erxes widget to appear'
        );
        script = basicCode;
        action = copied;
        break;
      case 'single':
        description = __(
          'For web apps built with asynchronous JavaScript. Paste the code below in main layout you want erxes chat to appear'
        );
        script = singlePageCode;
        action = singleCopied;
        break;
      case 'googletag':
        description = __(
          'To connect Google Tag Manager to erxes, you must have an active Google Tag Manager account with a published container'
        );
        extraContent = true;
        script = basicCode;
        action = contentCopied;
        break;
      case 'ios':
        extraContent = true;
        break;
      default:
        extraContent = true;
    }

    return this.renderContent(
      description,
      script,
      extraContent,
      currentTab,
      action
    );
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
        </Tabs>

        {this.renderContents()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="times-circle"
            uppercase={false}
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
