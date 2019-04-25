import { Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import { colors } from '../../../common/styles';
import { IImportHistory } from '../types';
import CircularProgressBar from './CircularProgressBar';

const Box = styled.div`
  display: flex;
  color: ${colors.colorCoreDarkGray};
  align-items: center;

  h5 {
    margin-top: 0;
  }

  svg {
    font-size: 10px;
    margin-right: 15px;
    flex-shrink: 0;
    align-self: baseline;

    text {
      fill: ${colors.colorCoreDarkGray};
    }
  }
`;

const Indicator = styled.div`
  position: relative;
  padding: 15px 30px 15px 20px;
  border-radius: 4px;
  background: ${colors.colorWhite};
  width: 390px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 20px auto;

  > a {
    outline: none;
    top: 13px;
    right: 20px;
    position: absolute;
    font-size: 10px;
    color: ${colors.colorCoreGray};
  }
`;

type Props = {
  percentage: number;
  close: () => void;
  id: string;
  importHistory: IImportHistory;
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

    return (
      <CircularProgressBar percentage={percent} strokeWidth={2} sqSize={40} />
    );
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

  showResult = () => {
    const { importHistory, id } = this.props;
    const { errorMsgs = [] } = importHistory;

    if (this.isDone()) {
      return (
        <div>
          {__('Import action is done')}. {this.showErrors(errorMsgs)}{' '}
          <a href={`/settings/importHistory/${id}`}>{__('Show result')}</a>{' '}
          {__('more specific')}
        </div>
      );
    }

    return __('Please wait while we are processing your data');
  };

  render() {
    const { importHistory } = this.props;

    return (
      <Indicator>
        <Box>
          {this.renderProgressBar()}
          <div>
            <h5>
              {importHistory.contentType === 'customer'
                ? __('Import customers')
                : __('Import companies')}
            </h5>
            {this.showResult()}
          </div>
        </Box>
        <a href="#" onClick={this.props.close}>
          <Icon icon="cancel" />
        </a>
      </Indicator>
    );
  }
}

export default ImportIndicator;
