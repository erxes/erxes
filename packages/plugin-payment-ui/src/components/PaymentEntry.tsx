import { ButtonMutate } from '@erxes/ui/src/components';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { getEnv, __ } from '@erxes/ui/src/utils';
import React from 'react';

import { getGqlString, getRefetchQueries } from '../containers/utils';
import { mutations } from '../graphql';
import { ByKindTotalCount } from '../types';
import { PAYMENTCONFIGS, PAYMENT_KINDS } from './constants';
import MonpayForm from './form/MonpayForm';
import PaypalForm from './form/PaypalForm';
import QpayForm from './form/QpayForm';
import SocialPayForm from './form/SocialPayForm';
import StorepayForm from './form/StorePayForm';
import { Box, PaymentItem, Ribbon, Type } from './styles';

type Props = {
  payment: any;
  getClassName: (type: string) => string;
  toggleBox: (kind: string) => void;
  queryParams: any;
  paymentsCount?: ByKindTotalCount;
};

function getCount(type: string, paymentsCount?: ByKindTotalCount) {
  const countByType = (paymentsCount && paymentsCount[type]) || 0;

  if (typeof countByType === 'undefined') {
    return null;
  }
  return <span>({countByType})</span>;
}

function renderType(type: string) {
  if (!type) {
    return null;
  }

  return (
    <Type>
      <Icon icon="comment-alt-lines" /> {__('Payment type')}
    </Type>
  );
}

const renderButton = ({
  values,
  isSubmitted,
  callback
}: IButtonMutateProps) => {
  return (
    <ButtonMutate
      mutation={getGqlString(mutations.paymentAdd)}
      variables={values}
      callback={callback}
      refetchQueries={getRefetchQueries()}
      isSubmitted={isSubmitted}
      type="submit"
      successMessage={__(`You successfully added a`) + `${values.kind}`}
    />
  );
};

function renderCreate(kind: string) {
  if (!kind) {
    return null;
  }

  const trigger = <button>+ {__('Add')}</button>;

  let formContent;

  switch (kind) {
    case PAYMENT_KINDS.QPAY:
      formContent = props => (
        <QpayForm {...props} renderButton={renderButton} />
      );
      break;
    case PAYMENT_KINDS.SOCIALPAY:
      formContent = props => (
        <SocialPayForm {...props} renderButton={renderButton} />
      );
      break;
    case PAYMENT_KINDS.MONPAY:
      formContent = props => (
        <MonpayForm {...props} renderButton={renderButton} />
      );
      break;
    case PAYMENT_KINDS.STOREPAY:
      formContent = props => (
        <StorepayForm {...props} renderButton={renderButton} />
      );
      break;
    case PAYMENT_KINDS.WECHATPAY:
      formContent = props => (
        <QpayForm {...props} isWechatpay={true} renderButton={renderButton} />
      );
      break;
    case PAYMENT_KINDS.PAYPAL:
      formContent = props => (
        <PaypalForm {...props} renderButton={renderButton} />
      );
      break;
    default:
      formContent = () => null;
      break;
  }

  const meta = PAYMENTCONFIGS.find(p => p.kind === kind);

  const title = meta ? `Add ${meta.name}` : 'Add payment config';

  if (!meta || !meta.isAvailable) {
    return null;
  }

  return <ModalTrigger title={title} trigger={trigger} content={formContent} />;
}

function Entry({ payment, getClassName, toggleBox, paymentsCount }: Props) {
  const { kind, isAvailable, name, description, logo, inMessenger } = payment;

  return (
    <PaymentItem key={name} className={getClassName(kind)}>
      <Box onClick={() => toggleBox(kind)} isInMessenger={inMessenger}>
        <img
          alt="logo"
          src={`${getEnv().REACT_APP_API_URL}/pl:payment/static/${logo}`}
        />
        <h5>
          {name} {getCount(kind, paymentsCount)}
        </h5>
        <p>
          {__(description)}
          {renderType(inMessenger)}
        </p>
        {!isAvailable && (
          <Ribbon>
            <span>{__('Coming soon')}</span>
          </Ribbon>
        )}
      </Box>
      {renderCreate(kind)}
    </PaymentItem>
  );
}

export default Entry;
