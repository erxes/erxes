import { Box, IntegrationItem, Ribbon, Type } from './styles';

import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { __ } from 'coreui/utils';
import { formatText } from '@erxes/ui-log/src/activityLogs/utils';

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

function Entry({
  integration,
  getClassName,
  toggleBox,
  totalCount,
  customLink
}: Props) {
  const { kind, isAvailable, createUrl, createModal } = integration;

  console.log('Home entry ...', kind, integration);

  const handleLink = () => {
    return customLink && customLink(kind, createUrl);
  };

  function renderCustomLink(isAvailable1) {
    if (
      ![
        INTEGRATION_KINDS.NYLAS_GMAIL,
        INTEGRATION_KINDS.NYLAS_OFFICE365
      ].includes(kind) ||
      !isAvailable1
    ) {
      return null;
    }

    return <button onClick={handleLink}>+{__('Add')}</button>;
  }

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
      {renderCustomLink(isAvailable)}
      {/* {renderCreate(createUrl, createModal, isAvailable)} */}
    </IntegrationItem>
  );
}

export default Entry;
