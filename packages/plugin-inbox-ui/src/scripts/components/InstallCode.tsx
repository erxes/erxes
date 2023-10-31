import Button from '@erxes/ui/src/components/Button';
import CopyToClipboard from 'react-copy-to-clipboard';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IScript } from '../types';
import { MarkdownWrapper } from '@erxes/ui-settings/src/styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getEnv } from '@erxes/ui/src/utils';

type Props = {
  script: IScript;
  closeModal?: () => void;
};

type State = {
  code: string;
  copied: boolean;
};

const getInstallCode = (id: string) => {
  const { REACT_APP_CDN_HOST, REACT_APP_API_URL } = getEnv();

  return `
    <script>
      (function() {
        var script = document.createElement('script');
        script.src = "${REACT_APP_CDN_HOST}/build/manager.bundle.js?id=${id}&apiUrl=${REACT_APP_API_URL}";
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
          <ReactMarkdown children={this.state.code || ''} />
          {this.state.code ? (
            <CopyToClipboard text={this.state.code} onCopy={this.onCopy}>
              <Button size="small" btnStyle="primary" icon="copy-1">
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
            icon="times-circle"
            onClick={this.props.closeModal && this.props.closeModal}
          >
            Close
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  }
}

export default InstallCode;
