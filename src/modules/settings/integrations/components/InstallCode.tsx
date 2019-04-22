import { getEnv } from 'apolloClient';
import { Button, EmptyState } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IIntegration } from 'modules/settings/integrations/types';
import { MarkdownWrapper } from 'modules/settings/styles';
import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as ReactMarkdown from 'react-markdown';

type Props = {
  integration: IIntegration;
  closeModal: () => void;
};

type State = {
  code: string;
  copied: boolean;
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

class InstallCode extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    let code = '';
    const integration = props.integration || {};

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand || {};

      code = getInstallCode(brand.code);
    }

    this.state = {
      code,
      copied: false
    };
  }

  onCopy = () => {
    this.setState({ copied: true });
  };

  render() {
    return (
      <>
        <MarkdownWrapper>
          <ReactMarkdown source={this.state.code} />
          {this.state.code ? (
            <CopyToClipboard text={this.state.code} onCopy={this.onCopy}>
              <Button
                size="small"
                btnStyle={this.state.copied ? 'primary' : 'success'}
                icon="copy"
              >
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
            Close
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default InstallCode;
