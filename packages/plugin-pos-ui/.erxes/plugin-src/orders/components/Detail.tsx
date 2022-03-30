import * as dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import {
  __,
  FieldStyle,
  SidebarCounter,
  SidebarList,
  Table
} from '@erxes/ui/src';
import { DetailRow, FinanceAmount, FlexRow } from '../../styles';
import { IOrderDet } from '../types';

type Props = {
  order: IOrderDet;
};

class PutResponseDetail extends React.Component<Props> {
  displayValue(order, name) {
    const value = _.get(order, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  renderRow(label, value) {
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <SidebarCounter>
            {value || '-'}
          </SidebarCounter>
        </FlexRow>
      </li>
    );
  }

  render() {
    const { order } = this.props;
    return (
      <SidebarList>
        {this.renderRow('Bill Number', order.number)}
        {this.renderRow('Date', dayjs(order.paidDate || order.createdAt).format('lll'))}

        <>
          {(order.putResponses || []).map(p => {
            return (
              <DetailRow>
                {this.renderRow('Bill ID', p.billId)}
                {this.renderRow('Ebarimt Date', dayjs(p.date).format('lll'))}
              </DetailRow>
            );
          }
          )}
        </>

        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                {__('Product')}
              </th>
              <th>
                {__('Count')}
              </th>
              <th>
                {__('Unit Price')}
              </th>
              <th>
                {__('Amount')}
              </th>
            </tr>
          </thead>
          <tbody id="orderItems">
            {(order.items || []).map(item => (
              <tr key={item._id}>
                <td>{item.productName}</td>
                <td>{item.count}</td>
                <td>{item.unitPrice}</td>
                <td>{item.count * item.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {this.renderRow('Total Amount', this.displayValue(order, 'totalAmount'))}

        <ul>
          {this.renderRow('Cash Amount', this.displayValue(order, 'cashAmount'))}
          {this.renderRow('Card Amount', this.displayValue(order, 'cardAmount'))}
          {this.renderRow('Mobile Amount', this.displayValue(order, 'mobileAmount'))}
        </ul>
      </SidebarList>
    )
  }
}

export default PutResponseDetail;