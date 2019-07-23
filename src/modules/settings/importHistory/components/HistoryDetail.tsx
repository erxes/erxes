import DataWithLoader from 'modules/common/components/DataWithLoader';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Table from 'modules/common/components/table';
import TextInfo from 'modules/common/components/TextInfo';
import React from 'react';
import styled from 'styled-components';
import { colors, dimensions } from '../../../common/styles';
import { __ } from '../../../common/utils';
import Wrapper from '../../../layout/components/Wrapper';
import { IImportHistory } from '../types';
import CircularProgressBar from './CircularProgressBar';

const TopContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  align-items: center;

  > div {
    flex: 1;
  }

  svg {
    margin-right: 40px;
    flex-shrink: 0;
    align-self: baseline;
    margin-top: 10px;

    text {
      fill: ${colors.colorCoreDarkGray};
    }
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;

  > div {
    margin-right: 20px;
    flex-basis: 160px;
    font-size: 14px;
    font-weight: 500;
  }
`;

type Props = {
  importHistory: IImportHistory;
  loading: boolean;
  percentage: number;
};

class HistoryDetail extends React.Component<Props> {
  renderProgressBar = () => {
    const { percentage, importHistory } = this.props;
    let percent = percentage;

    if (importHistory.status === 'Done') {
      percent = 100;
    }

    return (
      <CircularProgressBar sqSize={60} strokeWidth={3} percentage={percent} />
    );
  };

  renderContent = (importHistory: IImportHistory) => {
    const { status, total, failed, success } = importHistory;
    const { errorMsgs = [] } = importHistory;

    return (
      <>
        <TopContent>
          {this.renderProgressBar()}
          <div>
            <Row>
              <div>{__('Status')}:</div>
              <TextInfo hugeness="large">{status}</TextInfo>
            </Row>
            <Row>
              <div>{__('Total')}:</div>
              <TextInfo hugeness="large" textStyle="simple">
                {total}
              </TextInfo>
            </Row>
            <Row>
              <div>{__('Success')}:</div>
              <TextInfo textStyle="success" hugeness="large">
                {success}
              </TextInfo>
            </Row>
            <Row>
              <div>{__('Failed')}:</div>
              <TextInfo textStyle="danger" hugeness="large">
                {failed}
              </TextInfo>
            </Row>
          </div>
        </TopContent>
        <Table striped={true} alignTop={true}>
          <thead>
            <tr>
              <th>{__('Errors')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {errorMsgs.map((msg, index) => {
              return (
                <tr key={index}>
                  <td>{msg}</td>
                  <td />
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
  };

  render() {
    const { importHistory } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import histories'), link: '/settings/importHistories' },
      { title: __('Import History ') }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Import History ')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/28.svg"
                title="Import history"
                description={`You can track your recently imported customers or companies here`}
              />
            }
          />
        }
        content={
          <DataWithLoader
            loading={this.props.loading}
            data={this.renderContent(importHistory)}
            emptyText="No errors"
            emptyImage="/images/actions/15.svg"
          />
        }
        center={true}
      />
    );
  }
}

export default HistoryDetail;
