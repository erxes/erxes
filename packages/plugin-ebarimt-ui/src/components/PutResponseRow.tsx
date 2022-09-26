import _ from 'lodash';
import Button from '@erxes/ui/src/components/Button';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import queries from '../graphql/queries';
import React from 'react';
import { formatValue } from '@erxes/ui/src/utils';
import { IPutResponse } from '../types';
import Response from './Response';

type Props = {
  putResponse: IPutResponse;
  history: any;
};

function displayValue(putResponse, name) {
  const value = _.get(putResponse, name);
  return formatValue(value);
}

class PutResponseRow extends React.Component<Props, {}> {
  render() {
    const { putResponse, history } = this.props;

    const onClick = () => {
      client
        .query({
          query: gql(queries.getDealLink),
          variables: { _id: putResponse.contentId }
        })
        .then(data => {
          history.push(`${data.data.getDealLink}`);
        });
    };

    const onPrint = () => {
      const printContent = Response(putResponse);
      const myWindow =
        window.open(`__`, '_blank', 'width=800, height=800') || ({} as any);
      myWindow.document.write(printContent);
    };

    return (
      <tr>
        <td key={'BillID'}>{putResponse.billId} </td>
        <td key={'Date'}>{putResponse.date}</td>
        <td key={'success'}>{displayValue(putResponse, 'success')}</td>
        <td key={'billType'}>{displayValue(putResponse, 'billType')}</td>
        <td key={'taxType'}>{displayValue(putResponse, 'taxType')}</td>
        <td key={'amount'}>{displayValue(putResponse, 'amount')}</td>
        <td key={'message'}>{displayValue(putResponse, 'message')}</td>
        <td key={'ReturnBillId'}>{putResponse.sendInfo.returnBillId} </td>
        <td key={'actions'}>
          {putResponse.contentType === 'deal' && (
            <Button
              btnStyle="link"
              size="small"
              icon="external-link-alt"
              onClick={onClick}
            >
              Show Deal
            </Button>
          )}

          <Button
            btnStyle="link"
            size="small"
            icon="print"
            onClick={onPrint}
          ></Button>
        </td>
      </tr>
    );
  }
}

export default PutResponseRow;
