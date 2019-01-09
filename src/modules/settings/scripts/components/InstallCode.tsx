import { getEnv } from 'apolloClient';
import { Button, EmptyState } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { MarkdownWrapper } from 'modules/settings/styles';
import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as ReactMarkdown from 'react-markdown';
import { IScript } from '../types';

type Props = {
  script: IScript;
  closeModal: () => void;
};

type State = {
  code: string;
  copied: boolean;
};

const getInstallCode = (id: string) => {
  const { REACT_APP_CDN_HOST, REACT_APP_CDN_HOST_API } = getEnv();

  return `
    <script>
      (function() {
        var script = document.createElement('script');
        script.src = "${REACT_APP_CDN_HOST}/build/manager.bundle.js?id=${id}&apiUrl=${REACT_APP_CDN_HOST_API}";
        script.async = true;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    </script>
  `;
};

class InstallCode extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { script } = props;

    let code = '';

    // showed install code automatically in edit mode
    if (script) {
      code = getInstallCode(script._id);
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
      <React.Fragment>
        <MarkdownWrapper>
          <ReactMarkdown source={this.state.code} />
          {this.state.code ? (
            <CopyToClipboard text={this.state.code} onCopy={this.onCopy}>
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

export default InstallCode;
