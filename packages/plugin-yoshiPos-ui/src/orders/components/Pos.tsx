import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { NavLink, Link } from 'react-router-dom';

import NameCard from 'modules/common/components/nameCard/NameCard';
import AsyncComponent from 'modules/common/components/AsyncComponent';
import { ICustomerParams, IOrder, IOrderItemInput } from '../types';
import { ORDER_TYPES, POS_MODES } from '../../../constants';
import Calculation from './Calculation';
import OrderSearch from '../containers/layout/OrderSearch';
import { IUser } from 'modules/auth/types';
import {
  PosWrapper,
  MainContent,
  FlexCustomer,
  MenuContent,
  ProductsContent,
  FlexHeader,
  Divider,
  KioskMainContent,
  KioskMenuContent,
  KioskProductsContent,
  FooterContent,
  PosMenuContent,
  LogoSection
} from '../styles';
import { IConfig } from '../../types';
import CustomerForm from './drawer/CustomerForm';
import ProductSearch from '../containers/ProductSearch';
import KioskView from './kiosk';
import { renderFullName } from '../../common/utils';
import Icon from '../../common/components/Icon';
import FooterCalculation from './kiosk/FooterCalculation';
import SplitPaymentContainer from '../containers/SplitPaymentContainer';
import { Cards, TypeWrapper } from './drawer/style';
import Modal from 'react-bootstrap/Modal';
import { __ } from '../../common/utils';
import Tip from '../../common/components/Tip';
import { IPaymentParams } from '../containers/PosContainer';
import KioskPaymentForm from './drawer/KioskPaymentForm';
import Button from '../../common/components/Button';
import ConfirmList from './kiosk/ConfirmList';

const ProductsContainer = AsyncComponent(() =>
  import(/* webpackChunkName: "Pos" */ '../containers/ProductsContainer')
);

const CategoriesContainer = AsyncComponent(() =>
  import(/* webpackChunkName: "Pos" */ '../containers/CategoriesContainer')
);

type Props = {
  createOrder: (params, callback?) => void;
  posCurrentUser: IUser;
  currentConfig: IConfig;
  order: IOrder | null;
  orientation: string;
  updateOrder: (params, callback?) => Promise<IOrder>;
  settlePayment: (
    _id: string,
    params: IPaymentParams,
    callback?: () => void
  ) => void;
  productCategoriesQuery: any;
  productsQuery: any;
  addCustomer: (params: ICustomerParams) => void;
  qp: any;
  addOrderPayment: (params: any) => void;
  logout?: () => void;
  type?: string;
  onChangeProductBodyType: (type: string) => void;
  toggleModal: (modalContentType: string) => void;
  cancelOrder: (id: string) => void;
  handleModal: () => void;
  productBodyType?: string;
  modalContentType?: string;
  showMenu?: boolean;
  refetchOrder: () => void;
};

type State = {
  items: IOrderItemInput[];
  totalAmount: number;
  type: string;
  isTypeChosen: boolean;
  customerId: string;
  registerNumber: string;
  orderProps: any;
  paymentType: string;
};

const getTotalAmount = (items: IOrderItemInput[]) => {
  let total = 0;

  for (const i of items || []) {
    total += (i.unitPrice || 0) * i.count;
  }

  return total;
};

export default class Pos extends React.Component<Props, State> {
  timeoutId;

  constructor(props: Props) {
    super(props);

    const { order, type } = props;

    this.state = {
      items: order ? order.items : [],
      totalAmount: order ? getTotalAmount(order.items) : 0,
      type: type || (order && order.type ? order.type : ORDER_TYPES.EAT),
      customerId: order && order.customerId ? order.customerId : '',
      registerNumber: '',
      paymentType: 'card',
      orderProps: {},
      isTypeChosen: false
    };
  }

  onClickType = (type: string) => {
    this.setState({ type, isTypeChosen: !this.state.isTypeChosen });
  };

  setItems = (items: IOrderItemInput[]) => {
    this.setState({ items, totalAmount: getTotalAmount(items) });
  };

  changeItemCount = (item: IOrderItemInput) => {
    let items = this.state.items.map(i => {
      if (i.productId === item.productId && item._id === i._id) {
        i.count = item.count;
      }

      return i;
    });

    items = items.filter(i => i.count > 0);

    const totalAmount = getTotalAmount(items);

    this.setState({ items, totalAmount });
  };

  changeItemIsTake = (item: IOrderItemInput, value: boolean) => {
    const { type, items } = this.state;
    if (type !== ORDER_TYPES.EAT) {
      this.setState({ items: items.map(i => ({ ...i, isTake: true })) });
      return;
    }

    this.setState({
      items: items.map(i => (item._id === i._id ? { ...i, isTake: value } : i))
    });
  };

  // set state field that doesn't need amount calculation
  setOrderState = (name: string, value: any) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);

    if (name === 'type') {
      const { items } = this.state;
      const isTake = value !== ORDER_TYPES.EAT;
      this.setState({ items: items.map(i => ({ ...i, isTake })) });
    }
  };

  addOrder = (callback?: () => void) => {
    const { createOrder } = this.props;
    const { totalAmount, type, items, customerId } = this.state;

    const currentItems = items.map(item => ({
      _id: item._id,
      productId: item.productId,
      count: item.count,
      unitPrice: item.unitPrice,
      isPackage: item.isPackage,
      isTake: type !== ORDER_TYPES.EAT ? true : item.isTake
    }));

    const mode = localStorage.getItem('erxesPosMode') || '';

    createOrder(
      { items: currentItems, totalAmount, type, customerId, origin: mode },
      callback
    );
  };

  editOrder = (callback?: () => void) => {
    const { updateOrder, order } = this.props;
    const { totalAmount, type, items, customerId } = this.state;

    if (order && order._id) {
      const currentItems = items.map(item => ({
        _id: item._id,
        productId: item.productId,
        count: item.count,
        unitPrice: item.unitPrice,
        isPackage: item.isPackage,
        isTake: type !== ORDER_TYPES.EAT ? true : item.isTake
      }));

      updateOrder(
        {
          _id: order._id,
          items: currentItems,
          totalAmount,
          type,
          customerId
        },
        callback
      ).then((updatedOrder: any) => {
        if (updatedOrder && updatedOrder.items) {
          this.setState({
            items: updatedOrder.items,
            totalAmount: getTotalAmount(updatedOrder.items)
          });
        }
      });
    }
  };

  onOrdersChange = orderProps => {
    this.setState({ orderProps });
  };

  handlePayment = (params: IPaymentParams) => {
    const { order, settlePayment } = this.props;

    settlePayment(order ? order._id : '', params, () => this.setItems([]));
  };

  renderKioskModalContent() {
    const {
      currentConfig,
      settlePayment,
      order,
      modalContentType,
      orientation,
      toggleModal,
      addOrderPayment
    } = this.props;
    const { paymentType, items } = this.state;

    const options = currentConfig ? currentConfig.uiOptions : {};

    switch (modalContentType) {
      case 'payment':
        return (
          order && (
            <KioskPaymentForm
              orderId={order ? order._id : ''}
              options={options}
              closeDrawer={toggleModal}
              settlePayment={settlePayment}
              order={order}
              addOrderPayment={addOrderPayment}
              orientation={orientation}
              handlePayment={this.handlePayment}
              addOrder={this.addOrder}
              setItems={this.setItems}
              paymentMethod={paymentType}
            />
          )
        );
      case 'check':
        return (
          <ConfirmList
            order={order}
            items={items}
            isPortrait={orientation === 'portrait'}
            config={currentConfig}
            totalAmount={this.state.totalAmount}
            editOrder={this.editOrder}
            addOrder={this.addOrder}
            onClickModal={toggleModal}
          />
        );
      default:
        return null;
    }
  }

  renderCurrentLogin(uiOptions) {
    const mode = localStorage.getItem('erxesPosMode');
    const { order, posCurrentUser } = this.props;

    if (mode === POS_MODES.KIOSK) {
      if (order && order.customer) {
        const customer = order.customer;

        return (
          <>
            <Icon
              icon="home"
              onClick={() => {
                window.location.href = '/';
              }}
              size={36}
              color={uiOptions.colors ? uiOptions.colors.primary : ''}
            />
            <FlexCustomer>
              <NameCard.Avatar customer={customer} size={40} />
              {renderFullName(customer)}
            </FlexCustomer>
          </>
        );
      }

      return (
        <Icon
          icon="home"
          onClick={() => {
            window.location.href = '/';
          }}
          size={36}
          color={uiOptions.colors ? uiOptions.colors.primary : ''}
        />
      );
    }

    return <NameCard user={posCurrentUser} avatarSize={40} />;
  }

  renderSyncMenu() {
    const { posCurrentUser } = this.props;

    if (!posCurrentUser) {
      return '';
    }

    if (localStorage.getItem('erxesPosMode')) {
      return '';
    }

    return (
      <NavLink to="/settings">
        <Tip placement="top" key={Math.random()} text={__('Settings')}>
          <Icon icon={'settings'} size={18} />
        </Tip>
      </NavLink>
    );
  }

  renderKitchenMenu() {
    const { posCurrentUser, currentConfig } = this.props;

    if (!posCurrentUser || !currentConfig) {
      return '';
    }

    if (!currentConfig.kitchenScreen) {
      return '';
    }

    if (
      ![POS_MODES.POS, POS_MODES.KITCHEN].includes(
        localStorage.getItem('erxesPosMode') || ''
      )
    ) {
      return '';
    }

    return (
      <NavLink to="/kitchen-screen">
        <Tip
          placement="top"
          key={Math.random()}
          text={__('Show kitchen screen')}
        >
          <Icon icon={'desktop'} size={20} />
        </Tip>
      </NavLink>
    );
  }

  renderWaitingMenu() {
    const { posCurrentUser, currentConfig } = this.props;

    if (!posCurrentUser || !currentConfig) {
      return '';
    }

    if (!currentConfig.waitingScreen) {
      return '';
    }

    if (
      ![POS_MODES.POS, POS_MODES.WAITING].includes(
        localStorage.getItem('erxesPosMode') || ''
      )
    ) {
      return '';
    }

    return (
      <NavLink to="/waiting-screen">
        <Tip
          placement="top"
          key={Math.random()}
          text={__('Show waiting screen')}
        >
          <Icon icon={'wallclock'} size={17} />
        </Tip>
      </NavLink>
    );
  }

  renderProduct() {
    const { currentConfig, orientation, productsQuery } = this.props;
    const { items } = this.state;

    return (
      <>
        <FlexHeader>
          {this.renderCurrentLogin(
            currentConfig ? currentConfig.uiOptions : {}
          )}
          <ProductSearch productsQuery={productsQuery} />
        </FlexHeader>
        <Divider />
        <ProductsContainer
          setItems={this.setItems}
          items={items}
          productsQuery={productsQuery}
          orientation={orientation}
        />
      </>
    );
  }

  renderMainContent() {
    const {
      addCustomer,
      order,
      orientation,
      productBodyType,
      onChangeProductBodyType,
      refetchOrder
    } = this.props;

    switch (productBodyType) {
      case 'product': {
        return this.renderProduct();
      }
      case 'payment': {
        if (order) {
          return (
            <SplitPaymentContainer
              order={order}
              onOrdersChange={this.onOrdersChange}
              onChangeProductBodyType={onChangeProductBodyType}
              refetchOrder={refetchOrder}
            />
          );
        }

        return null;
      }
      case 'orderSearch': {
        return (
          <OrderSearch
            orientation={orientation}
            onChange={onChangeProductBodyType}
          />
        );
      }
      case 'customer': {
        return (
          <CustomerForm
            addCustomer={addCustomer}
            onChangeProductBodyType={onChangeProductBodyType}
          ></CustomerForm>
        );
      }
      case 'done': {
        const isPortrait = orientation === 'portrait';

        return (
          <TypeWrapper isPortrait={isPortrait}>
            <h2>{__('Thank you for choosing us')}</h2>

            <Cards isPortrait={isPortrait}>
              <div>
                <img src="/images/done-relax.gif" alt="card-reader" />
              </div>
            </Cards>

            <h2>
              {__('Your number')}:
              <b>{order && order.number ? order.number.split('_')[1] : ''}</b>
            </h2>
          </TypeWrapper>
        );
      }
      default: {
        return null;
      }
    }
  }

  renderHeader() {
    const { currentConfig } = this.props;
    const data = currentConfig ? currentConfig.uiOptions : {};

    return (
      <LogoSection color={data.colors ? data.colors.primary : ''}>
        <NavLink to={'/?home=true'}>
          <img src={data.logo} alt="logo11" />
        </NavLink>
        <div className="syncMenu">
          {this.renderSyncMenu()}
          {this.renderKitchenMenu()}
          {this.renderWaitingMenu()}
          <Tip placement="top" key={Math.random()} text={__('Logout')}>
            <Icon icon={'logout-2'} size={17} onClick={this.props.logout} />
          </Tip>
        </div>
      </LogoSection>
    );
  }

  renderKioskView(categories) {
    const {
      currentConfig,
      order,
      orientation,
      productsQuery,
      productBodyType,
      qp,
      showMenu,
      toggleModal,
      handleModal,
      cancelOrder,
      onChangeProductBodyType
    } = this.props;

    const { items, totalAmount, type, isTypeChosen } = this.state;
    const uiOptions = currentConfig ? currentConfig.uiOptions : {};

    const onBack = () => {
      this.onClickType('eat');
      this.setItems([]);
    };

    const products = (
      <ProductsContainer
        setItems={this.setItems}
        items={items}
        productsQuery={productsQuery}
        orientation={orientation}
      />
    );

    if (!isTypeChosen && !(qp && qp.id)) {
      return (
        <KioskView
          onClickType={this.onClickType}
          currentConfig={currentConfig}
        />
      );
    }

    return (
      <>
        <div className="headerKiosk">
          <Link to="/">
            <img
              src={uiOptions.kioskHeaderImage || '/images/headerKiosk.png'}
              alt="Kiosk header"
            />
          </Link>
        </div>
        <KioskMainContent>
          <KioskMenuContent>
            <MenuContent hasItems={items.length > 0}>
              <Button
                btnStyle="simple"
                icon="angle-left"
                block
                onClick={onBack}
              >
                Cancel
              </Button>
              {categories}
            </MenuContent>
          </KioskMenuContent>
          <KioskProductsContent>{products}</KioskProductsContent>
        </KioskMainContent>
        {items.length > 0 && (
          <FooterContent>
            <FooterCalculation
              orientation={orientation}
              totalAmount={totalAmount}
              setItems={this.setItems}
              setOrderState={this.setOrderState}
              onClickModal={toggleModal}
              items={items}
              changeItemCount={this.changeItemCount}
              changeItemIsTake={this.changeItemIsTake}
              onChangeProductBodyType={onChangeProductBodyType}
              productBodyType={productBodyType}
              config={currentConfig}
              order={order}
              type={type}
              cancelOrder={cancelOrder}
            />
          </FooterContent>
        )}

        {showMenu && (
          <Modal
            enforceFocus={false}
            onHide={handleModal}
            show={showMenu}
            animation={false}
            size="lg"
          >
            <Modal.Body>{this.renderKioskModalContent()}</Modal.Body>
          </Modal>
        )}
      </>
    );
  }

  render() {
    const {
      currentConfig,
      order,
      orientation,
      productCategoriesQuery,
      productsQuery,
      productBodyType,
      cancelOrder,
      onChangeProductBodyType
    } = this.props;

    const { items, totalAmount, type } = this.state;
    const mode = localStorage.getItem('erxesPosMode');

    const categories = (
      <CategoriesContainer
        productCategoriesQuery={productCategoriesQuery}
        productsQuery={productsQuery}
        orientation={orientation}
        mode={mode}
      />
    );

    if (mode === POS_MODES.KIOSK) {
      return this.renderKioskView(categories);
    }

    return (
      <>
        <PosWrapper>
          <Row>
            <Col sm={3}>
              <MainContent numPadding={true}>
                <PosMenuContent>
                  {this.renderHeader()}
                  {categories}
                </PosMenuContent>
              </MainContent>
            </Col>
            <Col md={8}>
              <MainContent numPadding={true}>
                <ProductsContent>{this.renderMainContent()}</ProductsContent>
              </MainContent>
            </Col>
            <Col md={3}>
              <MainContent>
                <Calculation
                  orientation={orientation}
                  totalAmount={totalAmount}
                  addOrder={this.addOrder}
                  editOrder={this.editOrder}
                  setOrderState={this.setOrderState}
                  setItems={this.setItems}
                  onChangeProductBodyType={onChangeProductBodyType}
                  items={items}
                  changeItemCount={this.changeItemCount}
                  changeItemIsTake={this.changeItemIsTake}
                  productBodyType={productBodyType}
                  config={currentConfig}
                  order={order}
                  orderProps={this.state.orderProps}
                  type={type}
                  cancelOrder={cancelOrder}
                />
              </MainContent>
            </Col>
          </Row>
        </PosWrapper>
      </>
    );
  } // end render()

  setupTimer() {
    const { order } = this.props;
    const { isTypeChosen } = this.state;
    const mode = localStorage.getItem('erxesPosMode') || '';

    // auto-refresh within 3 minutes if an order is not made in kiosk mode
    if (mode === POS_MODES.KIOSK) {
      // 5 min is enough to make an order
      this.timeoutId = setTimeout(() => {
        if (!order && isTypeChosen) {
          window.location.href = '/';
        }
      }, 60000 * 3);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }
}
