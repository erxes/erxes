import { ButtonMutate } from '@erxes/ui/src/components';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __, getEnv } from '@erxes/ui/src/utils';
import React from 'react';

import { getGqlString, getRefetchQueries } from '../containers/utils';
import { mutations } from '../graphql';
import { ByKindTotalCount } from '../types';
import { PAYMENTCONFIGS } from './constants';
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

  const meta: any = PAYMENTCONFIGS.find(p => p.kind === kind);

  const title = meta ? `Add ${meta.name}` : 'Add payment config';

  if (!meta || !meta.isAvailable) {
    return null;
  }

  const Component = meta.createModal;

  const formContent = props => (
    <Component {...props} renderButton={renderButton} metaData={meta} />
  );

  const size = meta.modalSize || 'lg';

  return (
    <ModalTrigger
      title={title}
      trigger={trigger}
      size={size}
      content={formContent}
    />
  );
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
