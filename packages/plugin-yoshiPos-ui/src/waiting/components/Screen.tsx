import Col from 'react-bootstrap/Col';
import OrderDetail from './OrderDetail';
import React from 'react';
import Row from 'react-bootstrap/Row';
import { __ } from 'modules/common/utils';
import { IConfig } from 'types';
import { IOrder } from '../../orders/types';
import { IUser } from 'modules/auth/types';
import { Label, Orders } from '../styles';
import { ScreenContent } from '../../orders/styles';

type Props = {
  editOrder: (doc) => void;
  posCurrentUser: IUser;
  currentConfig: IConfig;
  orders: IOrder[];
};

export default class Screen extends React.Component<Props> {
  renderOrders(order: any) {
    return <OrderDetail {...this.props} order={order} />;
  }

  renderCol() {
    const { orders, currentConfig } = this.props;
    const { uiOptions } = currentConfig;

    return (
      <>
        <Col md={12} className="fullHeight">
          <Label isReady={true} color={uiOptions.colors.primary}>
            <img
              src={uiOptions.logo || `/images/logo.png`}
              alt="logo"
              onClick={() => {
                window.location.href = '/';
              }}
            />
            <span>{__(`Дугаар бүхий хэрэглэгчид хоолоо авна уу.`)}</span>
          </Label>
          <Orders>
            {orders.map((order, index) => (
              <React.Fragment key={index}>
                {this.renderOrders(order)}
              </React.Fragment>
            ))}
          </Orders>
        </Col>
      </>
    );
  }

  renderContent() {
    const { orders } = this.props;
    const contentUrl = this.props.currentConfig.waitingScreen.contentUrl || '';

    if (!contentUrl) {
      return <></>;
    }

    let innerHeight = window.innerHeight;
    const innerWidth = window.innerWidth - 23;
    innerHeight -= 110;
    innerHeight -=
      127 * Math.ceil((orders || []).length / Math.floor(innerWidth / 210));

    return (
      <div>
        <iframe
          width={innerWidth}
          height={innerHeight}
          src={`${contentUrl}?autoplay=1&controls=0&loop=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; loop; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        ></iframe>
      </div>
    );
  }
  render() {
    return (
      <ScreenContent hasBackground={true} className="fullHeight">
        <Row>{this.renderCol()}</Row>
        <Row className="fullHeight">{this.renderContent()}</Row>
      </ScreenContent>
    );
  } // end render()
}
