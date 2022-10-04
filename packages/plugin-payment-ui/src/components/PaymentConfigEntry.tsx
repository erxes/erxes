import { __ } from '@erxes/ui/src/utils';
import React from 'react';

import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import QpayForm from './form/QpayForm';
import SocialPayForm from './form/SocialPayForm';
import { Box, PaymentConfigItem, Ribbon, Type } from './styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ButtonMutate } from '@erxes/ui/src/components';
import { mutations } from '../graphql';
import { IPaymentTypeCount } from 'types';
import { getRefetchQueries } from '../containers/utils';

type Props = {
  paymentConfig: any;
  getClassName: (type: string) => string;
  toggleBox: (kind: string) => void;
  queryParams: any;
  paymentConfigsCount?: IPaymentTypeCount;
};

function getCount(type: string, paymentConfigsCount?: IPaymentTypeCount) {
  const countByType = paymentConfigsCount
    ? type.toLowerCase().includes('social')
      ? paymentConfigsCount.socialPay
      : paymentConfigsCount.qpay
    : 0;

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
  name,
  values,
  isSubmitted,
  callback
}: IButtonMutateProps) => {
  return (
    <ButtonMutate
      mutation={mutations.paymentConfigsAdd}
      variables={values}
      callback={callback}
      refetchQueries={getRefetchQueries()}
      isSubmitted={isSubmitted}
      type="submit"
      successMessage={__(`You successfully added a`) + `${name}`}
    />
  );
};

function renderCreate(type: string) {
  const trigger = <button>+ {__('Add')}</button>;

  let formContent = props => (
    <QpayForm {...props} renderButton={renderButton} />
  );

  if (type.toLowerCase().includes('social')) {
    formContent = props => (
      <SocialPayForm {...props} renderButton={renderButton} />
    );
  }

  return (
    <ModalTrigger
      title={`Add ${type}`}
      trigger={trigger}
      content={formContent}
    />
  );
}

function Entry({
  paymentConfig,
  getClassName,
  toggleBox,
  paymentConfigsCount
}: Props) {
  const {
    type,
    isAvailable,
    name,
    description,
    logo,
    inMessenger
  } = paymentConfig;

  return (
    <PaymentConfigItem key={name} className={getClassName(type)}>
      <Box onClick={() => toggleBox(type)} isInMessenger={inMessenger}>
        <img alt="logo" src={logo} />
        <h5>
          {name} {getCount(name, paymentConfigsCount)}
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
      {renderCreate(name)}
    </PaymentConfigItem>
  );
}

export default Entry;
