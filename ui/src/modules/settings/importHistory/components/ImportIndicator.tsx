import Icon from 'modules/common/components/Icon';
import ProgressBar from 'modules/common/components/ProgressBar';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IImportHistory } from '../types';

const Capitalize = styledTS<{ isCapital?: boolean }>(styled.span)`
  text-transform: ${props => (props.isCapital ? 'capitalize' : 'none')};
`;

const Text = styled.div`
  line-height: 36px;
`;

type Props = {
  percentage: number;
  id: string;
  importHistory: IImportHistory;
  close: () => void;
  cancel: (id: string) => void;
  isRemovingImport: boolean;
  errors?: string[];
};

class ImportIndicator extends React.Component<Props> {
  isDone = () => {
    const { importHistory, isRemovingImport } = this.props;
    const { status } = importHistory;

    if ((!isRemovingImport && status === 'Done') || status === 'Removed') {
      return true;
    }

    return false;
  };

  renderType = (contentType: string, isCapital?: boolean) => {
    return <Capitalize isCapital={isCapital}>{__(contentType)}</Capitalize>;
  };

  getPercentage = () => {
    const { percentage, isRemovingImport } = this.props;
    let percent = percentage;

    if (this.isDone() || percent > 100 || isRemovingImport) {
      percent = 100;
    }

    return percent;
  };

  cancelCurrentImport = () => {
    const { cancel, id } = this.props;
    cancel(id);
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

  getSuccessText() {
    const { isRemovingImport, importHistory } = this.props;
    const id = importHistory._id;
    const { errorMsgs = [], contentType } = importHistory;

    if (isRemovingImport) {
      return (
        <div>
          {this.renderType(contentType, true)} {__('data successfully removed')}
          .
        </div>
      );
    }

    return (
      <div>
        {this.renderType(contentType, true)} {__('data successfully imported')}.{' '}
        {this.showErrors(errorMsgs || [])}{' '}
        {id && (
          <Link to={`/settings/importHistory/${id}`}>{__('Show result')}.</Link>
        )}
      </div>
    );
  }

  getIndicatorText() {
    const { isRemovingImport, importHistory, errors } = this.props;
    const { contentType } = importHistory;

    if (errors) {
      return errors.join(',');
    }

    if (isRemovingImport) {
      return (
        <>
          {__('Removing')} {this.renderType(contentType)} {__('data')}.
        </>
      );
    }

    return (
      <>
        <b>[{this.props.percentage}%]</b> {__('Importing')}{' '}
        {this.renderType(contentType)} {__('data')}. {__('You can')}{' '}
        <a href="#cancel" onClick={this.cancelCurrentImport}>
          {__('cancel')}
        </a>{' '}
        anytime.
      </>
    );
  }

  renderProgress = () => {
    if (this.isDone()) {
      return this.getSuccessText();
    }

    return <Text>{this.getIndicatorText()}</Text>;
  };

  renderCloseButton = () => {
    if (this.isDone()) {
      return (
        <a href="#cancel" onClick={this.props.close}>
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
