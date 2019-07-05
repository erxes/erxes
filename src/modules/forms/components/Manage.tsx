import { getEnv } from 'apolloClient';
import { Button, EmptyState } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { MarkdownWrapper } from 'modules/settings/styles';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import { IFormIntegration } from '../types';

type Props = {
  integration: IFormIntegration;
  closeModal: () => void;
};

type State = {
  code?: string;
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

class Manage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let code = '';
    const integration = props.integration;

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand;
      const form = integration.form;

      code = getInstallCode(brand.code, form.code || '');
    }

    this.state = {
      code,
      copied: false
    };
  }

  render() {
    const onCopy = () => this.setState({ copied: true });

    return (
      <React.Fragment>
        <MarkdownWrapper>
          <ReactMarkdown source={this.state.code || ''} />
          {this.state.code ? (
            <CopyToClipboard text={this.state.code} onCopy={onCopy}>
              <Button size="small" btnStyle="primary" icon="copy">
                {this.state.copied ? 'Copied' : 'Copy to clipboard'}
              </Button>
            </CopyToClipboard>
          ) : (
            <EmptyState icon="copy" text="No copyable code" size="small" />
          )}
        </MarkdownWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  }
}

export default Manage;
