import { __ } from '@erxes/ui/src/utils';
import React from 'react';

import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

import QpayConfigForm from './form/QpayConfigForm';
import { Box, IntegrationItem, Ribbon, Type } from './styles';

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

function renderCreate(type: string) {
  const trigger = <button>+ {__('Add')}</button>;
  const formContent = props => <QpayConfigForm />;

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
