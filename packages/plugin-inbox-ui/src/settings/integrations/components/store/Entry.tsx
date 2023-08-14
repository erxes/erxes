import {
  Box,
  IntegrationItem,
  Ribbon,
  Type
} from '@erxes/ui-inbox/src/settings/integrations/components/store/styles';

import Icon from '@erxes/ui/src/components/Icon';
import IntegrationForm from '../../containers/common/IntegrationForm';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { __ } from 'coreui/utils';
import { formatText } from '@erxes/ui-log/src/activityLogs/utils';

type TotalCount = {
  messenger: number;
  form: number;
  facebook: number;
  callpro: number;
  chatfuel: number;
  gmail: number;
  imap: number;
  office365: number;
  outlook: number;
  yahoo: number;
  line: number;
  telegram: number;
  viber: number;
  calls: number;
  twilio: number;
  whatsapp: number;
  exchange: number;
  telnyx: number;
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

function renderCreate(createUrl, kind, isAvailable) {
  if ((!createUrl && !kind) || !isAvailable) {
    return null;
  }

  const trigger = <button>+ {__('Add')}</button>;

  if (createUrl && kind && isAvailable) {
    return <Link to={`${createUrl}?kind=${kind}`}>+ {__('Add')}</Link>;
  }

  if ((createUrl || '').includes('create')) {
    return <Link to={createUrl}>+ {__('Add')}</Link>;
  }

  const formContent = props => <IntegrationForm {...props} type={kind} />;

  return (
    <ModalTrigger
      title={`Add ${formatText(kind)}`}
      trigger={trigger}
      content={formContent}
    />
  );
}

function Entry({ integration, getClassName, toggleBox, totalCount }: Props) {
  const { kind, isAvailable, createUrl } = integration;

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
      {renderCreate(createUrl, kind, isAvailable)}
    </IntegrationItem>
  );
}

export default Entry;
