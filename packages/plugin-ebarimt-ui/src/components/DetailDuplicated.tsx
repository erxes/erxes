import _ from 'lodash';
import dayjs from 'dayjs';
import {
  Button,
  SortHandler,
  Table,
} from '@erxes/ui/src/components';
import WithPermission from 'coreui/withPermission';
import { Alert, __, confirm, formatValue } from '@erxes/ui/src/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IPutResponse } from '../types';
import Response from './Response';
import PerResponse from './PerResponse';

export const displayValue = (putResponse, name) => {
  const value = _.get(putResponse, name);
  return formatValue(value);
};

interface IProps extends IRouterProps {
  putResponses: IPutResponse[];
  onReturnBill: (_id: string) => void;
}

type State = {
};


class DetailDuplicated extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  onPrint = (putResponse: IPutResponse) => {
    const printContent = PerResponse(putResponse);
    const printMianContent = Response(printContent);
    const myWindow =
      window.open(`__`, '_blank', 'width=800, height=800') || ({} as any);
    myWindow.document.write(printMianContent);
  };

  onReturn = (putResponse: IPutResponse) => {
    const { onReturnBill } = this.props;
    return confirm("This will permanently update are you absolutely sure?")
      .then(() => {
        onReturnBill(putResponse._id);
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  }

  renderReturnBtn = (putResponse: IPutResponse) => {
    return (
      <WithPermission action="specialReturnBill">
        <Button
          btnStyle="link"
          size="small"
          icon="unlock-alt"
          onClick={this.onReturn.bind(this, putResponse)}
        ></Button>
      </WithPermission>
    )
  }

  render() {
    const {
      putResponses,
    } = this.props;
    return (
      <Table whiteSpace="nowrap" bordered={true} hover={true} responsive={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={'billId'} label={__('BillID')} />
            </th>
            <th>
              <SortHandler sortField={'number'} label={__('Number')} />
            </th>
            <th>
              <SortHandler sortField={'date'} label={__('Date')} />
            </th>
            <th>
              <SortHandler sortField={'success'} label={__('Success')} />
            </th>
            <th>
              <SortHandler sortField={'billType'} label={__('Bill Type')} />
            </th>
            <th>
              <SortHandler sortField={'taxType'} label={__('Tax Type')} />
            </th>
            <th>
              <SortHandler sortField={'amount'} label={__('Amount')} />
            </th>
            <th>
              <SortHandler
                sortField={'returnBillId'}
                label={__('Return BillID')}
              />
            </th>
            <th>Үйлдлүүд</th>
          </tr>
        </thead>
        <tbody id="putResponses">
          {(putResponses || []).map(putResponse => (
            <tr key={putResponse._id}>
              <td key={'BillID'}>{putResponse.billId} </td>
              <td key={'number'}>{putResponse.number} </td>
              <td key={'Date'}>
                {putResponse.date ||
                  dayjs(putResponse.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </td>
              <td key={'success'}>{displayValue(putResponse, 'success')}</td>
              <td key={'billType'}>{displayValue(putResponse, 'billType')}</td>
              <td key={'taxType'}>{displayValue(putResponse, 'taxType')}</td>
              <td key={'amount'}>{displayValue(putResponse, 'amount')}</td>
              <td key={'ReturnBillId'}>{putResponse.sendInfo?.returnBillId} </td>
              <td key={'actions'}>
                <Button
                  btnStyle="link"
                  size="small"
                  icon="print"
                  onClick={this.onPrint.bind(this, putResponse)}
                ></Button>
                {this.renderReturnBtn(putResponse)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
}

export default withRouter<IRouterProps>(DetailDuplicated);
