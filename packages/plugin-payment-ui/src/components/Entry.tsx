import { __ } from '@erxes/ui/src/utils';
import React from 'react';

import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

// import QpayConfigForm from './form/QpayConfigForm';
import QpayForm from './form/QpayForm';
import SocialPayForm from './form/SocialPayForm';
// import SpayConfigForm from './form/SpayConfigForm';
import { Box, IntegrationItem, Ribbon, Type } from './styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ButtonMutate } from '@erxes/ui/src/components';
import { mutations } from '../graphql';

type TotalCount = {
  messenger: number;
  facebook: number;
};

type Props = {
  integration: any;
  getClassName: (selectedKind: string) => string;
  toggleBox: (kind: string) => void;
  customLink?: (kind: string, addLink: string) => void;
  queryParams: any;
  totalCount: TotalCount;
};

function getCount(kind: string, totalCount: TotalCount) {
  const countByKind = totalCount[kind];

  if (typeof countByKind === 'undefined') {
    return null;
  }

  return <span>({countByKind})</span>;
}

function renderType(type: string) {
  if (!type) {
    return null;
  }

  return (
    <Type>
      <Icon icon="comment-alt-lines" /> {__('Works with messenger')}
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
      // refetchQueries={getRefetchQueries(this.props.kind)}
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

function Entry({ integration, getClassName, toggleBox, totalCount }: Props) {
  const { kind, isAvailable } = integration;

  return (
    <IntegrationItem key={integration.name} className={getClassName(kind)}>
      <Box
        onClick={() => toggleBox(kind)}
        isInMessenger={integration.inMessenger}
      >
        <img alt="logo" src={integration.logo} />
        <h5>
          {integration.name} {getCount(kind, totalCount)}
        </h5>
        <p>
          {__(integration.description)}
          {renderType(integration.inMessenger)}
        </p>
        {!isAvailable && (
          <Ribbon>
            <span>{__('Coming soon')}</span>
          </Ribbon>
        )}
      </Box>
      {renderCreate(integration.name)}
    </IntegrationItem>
  );
}

export default Entry;
