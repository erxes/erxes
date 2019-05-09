import { Icon, ProgressBar } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IImportHistory } from '../types';

const Capitalize = styledTS<{ isCapital?: boolean }>(styled.span)`
  text-transform: ${props => (props.isCapital ? 'capitalize' : 'none')};
`;

type Props = {
  percentage: number;
  id: string;
  importHistory: IImportHistory;
  close: () => void;
  cancel: (id: string) => void;
};

class ImportIndicator extends React.Component<Props> {
  isDone = () => {
    if (this.props.importHistory.status === 'Done') {
      return true;
    }

    return false;
  };

  getPercentage = () => {
    const { percentage } = this.props;
    let percent = percentage;

    if (this.isDone()) {
      percent = 100;
    }

    return percent;
  };

  showErrors = (errorMsgs: string[]) => {
    if (errorMsgs.length) {
      return (
        <span>
          {__('There are')} <b>{errorMsgs.length}</b> {__('errors acquired')}.
        </span>
      );
    }

    return null;
  };

  renderType = (contentType: string, isCapital?: boolean) => {
    return <Capitalize isCapital={isCapital}>{__(contentType)}</Capitalize>;
  };

  cancel = () => {
    const { cancel, id } = this.props;
    cancel(id);
  };

  renderProgress = () => {
    const { importHistory, id } = this.props;
    const { errorMsgs = [], contentType } = importHistory;

    if (this.isDone()) {
      return (
        <div>
          {this.renderType(contentType, true)}{' '}
          {__('data successfully imported')}. {this.showErrors(errorMsgs)}{' '}
          <Link to={`/settings/importHistory/${id}`}>{__('Show result')}</Link>.
        </div>
      );
    }

    return (
      <>
        <b>[{this.props.percentage}%]</b> {__('Importing')}{' '}
        {this.renderType(contentType)} {__('data')}. You can{' '}
        <a onClick={this.cancel}>{__('cancel')}</a> anytime.
      </>
    );
  };

  renderCloseButton = () => {
    if (this.isDone()) {
      return (
        <a href="#" onClick={this.props.close}>
          <Icon icon="cancel" />
        </a>
      );
    }

    return null;
  };

  render() {
    return (
      <ProgressBar
        percentage={this.getPercentage()}
        close={this.renderCloseButton()}
      >
        {this.renderProgress()}
      </ProgressBar>
    );
  }
}

export default ImportIndicator;
