import { Icon, ProgressBar } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IImportHistory } from '../types';

type Props = {
  importHistory: IImportHistory;
  setRemoveProgress: (removeIndicator: React.ReactNode) => void;
};

class ImportIndicator extends React.Component<Props> {
  renderProgress = () => {
    const { importHistory } = this.props;
    const { contentType } = importHistory;

    return (
      <>
        {__('Removing')} {__(contentType)} {__('data')}.
      </>
    );
  };

  clearProgressBar = () => {
    this.props.setRemoveProgress(null);
  };

  renderCloseButton = () => {
    return (
      <a href="#" onClick={this.clearProgressBar}>
        <Icon icon="cancel" />
      </a>
    );
  };

  render() {
    return (
      <ProgressBar percentage={100} close={this.renderCloseButton()}>
        {this.renderProgress()}
      </ProgressBar>
    );
  }
}

export default ImportIndicator;
