import { ButtonMutate } from '@erxes/ui/src/components';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

import { getRefetchQueries } from '../containers/utils';
import { mutations } from '../graphql';
import { ByKindTotalCount } from '../types';
import { PAYMENT_KINDS, PAYMENTCONFIGS } from './constants';
import QpayForm from './form/QpayForm';
import SocialPayForm from './form/SocialPayForm';
import { Box, PaymentConfigItem, Ribbon, Type } from './styles';

type Props = {
  paymentConfig: any;
  getClassName: (type: string) => string;
  toggleBox: (kind: string) => void;
  queryParams: any;
  paymentConfigsCount?: ByKindTotalCount;
};

function getCount(type: string, paymentConfigsCount?: ByKindTotalCount) {
  const countByType = (paymentConfigsCount && paymentConfigsCount[type]) || 0;

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
    default:
      formContent = () => null;
      break;
  }

  const meta = PAYMENTCONFIGS.find(p => p.kind === kind);

  const title = meta ? `Add ${meta.name}` : 'Add payment config';

  return <ModalTrigger title={title} trigger={trigger} content={formContent} />;
}

function Entry({
  paymentConfig,
  getClassName,
  toggleBox,
  paymentConfigsCount
}: Props) {
  const {
    kind,
    isAvailable,
    name,
    description,
    logo,
    inMessenger
  } = paymentConfig;

  return (
    <PaymentConfigItem key={name} className={getClassName(kind)}>
      <Box onClick={() => toggleBox(kind)} isInMessenger={inMessenger}>
        <img alt="logo" src={logo} />
        <h5>
          {name} {getCount(kind, paymentConfigsCount)}
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
    </PaymentConfigItem>
  );
}

export default Entry;
