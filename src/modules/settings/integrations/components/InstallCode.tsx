import { getEnv } from 'apolloClient';
import { Button, EmptyState, Info } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IIntegration } from 'modules/settings/integrations/types';
import { MarkdownWrapper } from 'modules/settings/styles';
import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as ReactMarkdown from 'react-markdown';

type Props = {
  integration: IIntegration;
  closeModal: () => void;
  positivButton?: React.ReactNode;
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
    const { code, copied } = this.state;
    return (
      <>
        <Info>
          {__(
            'Paste the code below before the body tag on every page you want erxes chat to appear'
          )}
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
