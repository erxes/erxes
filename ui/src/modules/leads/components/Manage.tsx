import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { __, getEnv } from 'modules/common/utils';
import { MarkdownWrapper } from 'modules/settings/styles';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import { ILeadIntegration } from '../types';

type Props = {
  integration: ILeadIntegration;
  closeModal: () => void;
};

type State = {
  code?: string;
  embedCode?: string;
  buttonCode?: string;
  copied: boolean;
};

const installCodeIncludeScript = (type: string) => {
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

const getInstallCode = (brandCode: string, formCode: string) => {
  return `
    <script>
      window.erxesSettings = {
        forms: [{
          brand_id: "${brandCode}",
          form_id: "${formCode}",
        }],
      };
      ${installCodeIncludeScript('form')}
    </script>
  `;
};

const getEmbedCode = (formCode: string) => {
  return `
    <div data-erxes-embed="${formCode}" style="width:900px;height:300px"></div>
  `;
};

const getButtonCode = (formCode: string) => {
  return `
    data-erxes-modal="${formCode}"
  `;
};

class Manage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let code = '';
    let embedCode = '';
    let buttonCode = '';
    const integration = props.integration;

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand;
      const form = integration.form || {};

      if (brand) {
        code = getInstallCode(brand.code, form.code || '');
      }

      embedCode = getEmbedCode(form.code || '');
      buttonCode = getButtonCode(form.code || '');
    }

    this.state = {
      code,
      embedCode,
      buttonCode,
      copied: false
    };
  }

  renderContent = () => {
    const onCopy = () => this.setState({ copied: true });

    const { code, embedCode, copied, buttonCode } = this.state;

    return (
      <>
        <MarkdownWrapper>
          <ReactMarkdown source={code || ''} />
          {code ? (
            <CopyToClipboard text={code} onCopy={onCopy}>
              <Button btnStyle="primary" icon="copy-1" uppercase={false}>
                {copied ? 'Copied' : 'Copy to clipboard'}
              </Button>
            </CopyToClipboard>
          ) : (
            <EmptyState
              icon="copy"
              text="No copyable code. You should connect Popup to brand first"
              size="small"
            />
          )}
        </MarkdownWrapper>
        <br />
        <Info>
          {__(
            'If your flow type is embedded paste the code below additionally that you want erxes pop ups to appear'
          )}
        </Info>
        <MarkdownWrapper>
          <ReactMarkdown source={embedCode || ''} />
        </MarkdownWrapper>
        <br />
        <Info>
          {__(
            'If your flow type is popup paste the code below additionally in your button'
          )}
        </Info>
        <MarkdownWrapper>
          <ReactMarkdown source={buttonCode || ''} />
        </MarkdownWrapper>
      </>
    );
  };

  render() {
    return (
      <>
        <Info>
          {__(
            'Paste the code below before the body tag on every page you want erxes pop ups to appear'
          )}
        </Info>

        {this.renderContent()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.closeModal}
          >
            Close
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default Manage;
