import { Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../../../common/styles';
import { IImportHistory } from '../types';

const Box = styled.div`
  position: relative;
  z-index: 3;
  color: ${colors.colorCoreDarkGray};
  text-align: center;
`;

const Indicator = styled.div`
  position: relative;
  padding: 8px 30px;
  background: ${colors.bgMain};
  width: 100%;
  height: 36px;
  box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.05);

  a:hover {
    cursor: pointer;
  }

  > a {
    outline: none;
    top: 11px;
    right: 20px;
    position: absolute;
    font-size: 10px;
    color: ${colors.colorCoreGray};
  }
`;

const Progress = styledTS<{ percentage: number }>(styled.div)`
  position: absolute;
  width: ${props => props.percentage}%;
  background: #dddeff;
  left: 0;
  top: 0;
  bottom: 0;
  background-image: linear-gradient(45deg,rgba(255,255,255,.1) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.1) 75%,transparent 75%,transparent);
  background-size: 16px 16px;
  border-radius: 2px;
`;

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

  renderProgressBar = () => {
    const { percentage } = this.props;
    let percent = percentage;

    if (this.isDone()) {
      percent = 100;
    }

    return <Progress percentage={percent} />;
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

  showResult = () => {
    const { importHistory, id, percentage } = this.props;
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
      <div>
        {__('Importing')} {this.renderType(contentType)} {__('data')} -{' '}
        <b>{percentage}%</b> You can <a onClick={this.cancel}>{__('cancel')}</a>{' '}
        anytime.
      </div>
    );
  };

  renderCloseButton = () => {
    const { importHistory, close } = this.props;

    if (importHistory.status === 'Done') {
      return (
        <a href="#" onClick={close}>
          <Icon icon="cancel" />
        </a>
      );
    }

    return null;
  };

  render() {
    return (
      <Indicator>
        {this.renderProgressBar()}
        <Box>{this.showResult()}</Box>
        {this.renderCloseButton()}
      </Indicator>
    );
  }
}

export default ImportIndicator;
