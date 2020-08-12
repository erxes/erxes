import { formatText } from 'modules/activityLogs/utils';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import NylasForm from 'modules/settings/integrations/containers/mail/Form';
import React from 'react';
import { Link } from 'react-router-dom';
import { INTEGRATION_KINDS } from '../../constants';
import IntegrationForm from '../../containers/common/IntegrationForm';
import KnowledgeBase from '../../containers/knowledgebase/Form';
import Lead from '../../containers/lead/Form';
import LineForm from '../../containers/line/Form';
import Twitter from '../../containers/twitter/Twitter';
import Website from '../../containers/website/Form';
import { Box, IntegrationItem, Ribbon, Type } from './styles';

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
  twilio: number;
  whatsapp: number;
  exchange: number;
};

type Props = {
  integration: any;
  getClassName: (selectedKind: string) => string;
  toggleBox: (kind: string) => void;
  customLink?: (kind: string, addLink: string) => void;
  messengerAppsCount?: number;
  queryParams: any;
  totalCount: TotalCount;
};

function getCount(
  kind: string,
  totalCount: TotalCount,
  messengerAppsCount?: number
) {
  const countByKind = totalCount[kind];

  if (typeof messengerAppsCount === 'number') {
    return <span>({messengerAppsCount})</span>;
  }

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

function renderCreate(createUrl, kind) {
  if (!createUrl && !kind) {
    return null;
  }

  const trigger = <button>+ {__('Add')}</button>;

  if (kind === INTEGRATION_KINDS.FACEBOOK_MESSENGER) {
    return (
      <Link to={`${createUrl}?kind=${INTEGRATION_KINDS.FACEBOOK_MESSENGER}`}>
        + {__('Add')}
      </Link>
    );
  }

  if (kind === INTEGRATION_KINDS.FACEBOOK_POST) {
    return (
      <Link to={`${createUrl}?kind=${INTEGRATION_KINDS.FACEBOOK_POST}`}>
        + {__('Add')}
      </Link>
    );
  }

  if (kind === INTEGRATION_KINDS.MESSENGER) {
    return <Link to={createUrl}>+ {__('Add')}</Link>;
  }

  if (kind === INTEGRATION_KINDS.LEAD) {
    const content = props => <Lead {...props} />;

    return (
      <ModalTrigger title="Add Pop Ups" trigger={trigger} content={content} />
    );
  }

  if (kind === 'knowledgeBase') {
    const content = props => <KnowledgeBase {...props} />;

    return (
      <ModalTrigger
        title="Add knowledge base"
        trigger={trigger}
        content={content}
      />
    );
  }

  if (kind === 'website') {
    const content = props => <Website {...props} />;

    return (
      <ModalTrigger title="Add website" trigger={trigger} content={content} />
    );
  }

  if (
    kind === INTEGRATION_KINDS.NYLAS_OFFICE365 ||
    kind === INTEGRATION_KINDS.NYLAS_GMAIL
  ) {
    const content = props => <NylasForm kind={kind} {...props} />;

    return (
      <ModalTrigger
        title={`Add ${formatText(kind)}`}
        content={content}
        autoOpenKey={`show${formatText(kind, true)}Modal`}
      />
    );
  }

  if (
    kind === INTEGRATION_KINDS.NYLAS_IMAP ||
    kind === INTEGRATION_KINDS.NYLAS_EXCHANGE ||
    kind === INTEGRATION_KINDS.NYLAS_OUTLOOK ||
    kind === INTEGRATION_KINDS.NYLAS_YAHOO
  ) {
    const content = props => <NylasForm kind={kind} {...props} />;

    return (
      <ModalTrigger
        title={`Add ${formatText(kind)}`}
        trigger={trigger}
        content={content}
        autoOpenKey={`show${formatText(kind)}Modal`}
      />
    );
  }

  if (kind === INTEGRATION_KINDS.GMAIL) {
    return <Link to={createUrl}>+ {__('Add')}</Link>;
  }

  if (kind === 'twitter') {
    const content = props => <Twitter {...props} />;

    return (
      <ModalTrigger title="Add twitter" trigger={trigger} content={content} />
    );
  }

  if (kind === INTEGRATION_KINDS.SMOOCH_LINE) {
    const content = props => <LineForm {...props} />;

    return (
      <ModalTrigger title="Add Line" trigger={trigger} content={content} />
    );
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

function Entry({
  integration,
  getClassName,
  toggleBox,
  messengerAppsCount,
  totalCount,
  customLink
}: Props) {
  const { kind } = integration;
  const { createUrl, createModal } = integration;

  const boxOnClick = () => toggleBox(kind);

  const handleLink = () => {
    return customLink && customLink(kind, createUrl);
  };

  function renderCustomLink() {
    if (
      ![
        INTEGRATION_KINDS.NYLAS_GMAIL,
        INTEGRATION_KINDS.NYLAS_OFFICE365
      ].includes(kind)
    ) {
      return null;
    }

    return <button onClick={handleLink}>+{__('Add')}</button>;
  }

  return (
    <IntegrationItem key={integration.name} className={getClassName(kind)}>
      <Box onClick={boxOnClick} isInMessenger={integration.inMessenger}>
        <img alt="logo" src={integration.logo} />
        <h5>
          {integration.name} {getCount(kind, totalCount, messengerAppsCount)}
        </h5>
        <p>
          {integration.description}
          {renderType(integration.inMessenger)}
        </p>
        {!integration.isAvailable && (
          <Ribbon>
            <span>Coming soon</span>
          </Ribbon>
        )}
      </Box>
      {renderCustomLink()}
      {renderCreate(createUrl, createModal)}
    </IntegrationItem>
  );
}

export default Entry;
