import React from 'react';

import { ButtonMutate } from '@erxes/ui/src/components';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';

import { mutations } from '../graphql';
import { IPaymentDocument } from '../types';
import QpayForm from './form/QpayForm';
import SocialPayForm from './form/SocialPayForm';
import MonpayForm from './form/MonpayForm';
import PaypalFrom from './form/PaypalForm';
import StorepayForm from './form/StorePayForm';
import { getGqlString, getRefetchQueries } from '../containers/utils';
import { PAYMENT_KINDS } from './constants';

type Props = {
  _id?: string;
  payment: IPaymentDocument;
  removePayment: (payment: IPaymentDocument) => void;
};

type State = {
  externalData: any;
};

class IntegrationListItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      externalData: null
    };
  }

  renderRemoveAction() {
    const { payment, removePayment } = this.props;

    if (!removePayment) {
      return null;
    }

    const onClick = () => removePayment(payment);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  }

  renderEditAction() {
    const { payment } = this.props;
    const { kind } = payment;

    const renderButton = ({
      passedName: name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={getGqlString(mutations.paymentEdit)}
          variables={{ _id: payment._id, ...values }}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully edited a`) + `${name}`}
        />
      );
    };

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    let content;

    switch (kind) {
      case PAYMENT_KINDS.QPAY:
        content = props => (
          <QpayForm {...props} payment={payment} renderButton={renderButton} />
        );
        break;
      case PAYMENT_KINDS.SOCIALPAY:
        content = props => (
          <SocialPayForm
            {...props}
            payment={payment}
            renderButton={renderButton}
          />
        );
        break;
      case PAYMENT_KINDS.MONPAY:
        content = props => (
          <MonpayForm
            {...props}
            payment={payment}
            renderButton={renderButton}
          />
        );
        break;
      case PAYMENT_KINDS.STOREPAY:
        content = props => (
          <StorepayForm
            {...props}
            payment={payment}
            renderButton={renderButton}
          />
        );
        break;
      case PAYMENT_KINDS.PAYPAL:
        content = props => (
          <PaypalFrom
            {...props}
            payment={payment}
            renderButton={renderButton}
          />
        );
        break;
      default:
        content = () => null;
    }

    return (
      <ActionButtons>
        <ModalTrigger
          title="Edit config"
          trigger={editTrigger}
          content={content}
        />
      </ActionButtons>
    );
  }

  render() {
    const { payment } = this.props;
    const labelStyle = 'success';
    const status = payment.status;

    return (
      <tr key={payment._id}>
        <td>{payment.name}</td>
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>

        <td>
          <ActionButtons>
            {this.renderEditAction()}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default IntegrationListItem;
