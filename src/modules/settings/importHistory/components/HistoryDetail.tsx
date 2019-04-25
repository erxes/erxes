import * as React from 'react';
import styled from 'styled-components';
import {
  DataWithLoader,
  HeaderDescription,
  Table,
  TextInfo
} from '../../../common/components';
import { colors, dimensions } from '../../../common/styles';
import { __ } from '../../../common/utils';
import { Wrapper } from '../../../layout/components';
import { IImportHistory } from '../types';

const TopContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
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
};

class HistoryDetail extends React.Component<Props> {
  renderContent = (importHistory: IImportHistory) => {
    const { status, total, failed, success } = importHistory;
    const { errorMsgs = [] } = importHistory;

    return (
      <React.Fragment>
        <TopContent>
          <Row>
            <div>{__('Status')}:</div>
            <TextInfo textStyle="simple" hugeness="large">
              {status}
            </TextInfo>
          </Row>
          <Row>
            <div>{__('Total')}:</div>
            <TextInfo hugeness="large">{total}</TextInfo>
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
      </React.Fragment>
    );
  };

  render() {
    const { importHistory } = this.props;
    const { errorMsgs = [] } = importHistory;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import History ') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/28.svg"
                title="Import history status"
                description={`You can track your recently imported customers or companies here`}
              />
            }
          />
        }
        content={
          <DataWithLoader
            loading={this.props.loading}
            count={errorMsgs.length}
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
