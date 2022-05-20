import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IUser } from '../../auth/types';
import { PosWrapper, MainContent } from '../../orders/styles';
import { IConfig } from '../../types';
import { __ } from '../../common/utils';
import { IOrder, FullOrderQueryResponse } from '../../orders/types';
import Table from '../../common/components/table';
import { FlexEnd, ScreenWrapper } from '../styles';
import Button from '../../common/components/Button';
import OrderDetail from './OrderDetail';

type Props = {
  editOrder: (doc) => void;
  posCurrentUser: IUser;
  currentConfig: IConfig;
  orders: IOrder[];
  doneOrders: IOrder[];
  orderQuery: FullOrderQueryResponse;
};

export default class Screen extends React.Component<Props> {
  renderOrder(order: IOrder) {
    return <OrderDetail key={order._id} {...this.props} order={order} />;
  }

  renderDoneOrders(order: IOrder) {
    const onClickUndo = e => {
      this.props.editOrder({ _id: order._id, status: 'doing' });
    };

    return (
      <Button
        btnStyle="warning"
        onClick={onClickUndo}
        size="large"
        icon="arrow-from-top"
      >
        {order.number.split('_')[1]}
      </Button>
    );
  }

  render() {
    const { orders, doneOrders, currentConfig } = this.props;

    return (
      <MainContent hasBackground={true}>
        <PosWrapper>
          <FlexEnd>
            {doneOrders.map((order, index) => (
              <React.Fragment key={index}>
                {this.renderDoneOrders(order)}
              </React.Fragment>
            ))}
          </FlexEnd>
          <Row>
            <Col>
              <ScreenWrapper
                color={currentConfig.uiOptions.colors.secondary}
                innerWidth={window.innerWidth}
              >
                <Table>
                  <thead>
                    <tr>
                      <th>{__('Number')}</th>
                      <th>{__('Order')}</th>
                      <th>{__('From where')}</th>
                      <th>{__('Time')}</th>
                      <th>{__('Type')}</th>
                      <th>{__('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody id="products">
                    {orders.map(order => this.renderOrder(order))}
                  </tbody>
                </Table>
              </ScreenWrapper>
            </Col>
          </Row>
        </PosWrapper>
      </MainContent>
    );
  } // end render()
}
