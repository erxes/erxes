import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import CallPro from 'modules/settings/integrations/containers/callpro/Form';
import Gmail from 'modules/settings/integrations/containers/gmail/Form';
import NylasForm from 'modules/settings/integrations/containers/mail/Form';
import React from 'react';
import { Link } from 'react-router-dom';
import { INTEGRATION_KINDS } from '../../constants';
import Chatfuel from '../../containers/chatfuel/Form';
import Facebook from '../../containers/facebook/Form';
import KnowledgeBase from '../../containers/knowledgebase/Form';
import Lead from '../../containers/lead/Form';
import LineForm from '../../containers/line/Form';
import TelegramForm from '../../containers/telegram/Form';
import TwilioForm from '../../containers/twilioSms/Form';
import Twitter from '../../containers/twitter/Twitter';
import ViberForm from '../../containers/viber/Form';
import Website from '../../containers/website/Form';
import WhatsappForm from '../../containers/whatsapp/Form';
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
      <Icon icon="chat" /> {__('Works with messenger')}
    </Type>
  );
}

function renderCreate(createUrl, createModal) {
  if (!createUrl && !createModal) {
    return null;
  }

  if (createModal === INTEGRATION_KINDS.FACEBOOK_MESSENGER) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => (
      <Facebook kind={INTEGRATION_KINDS.FACEBOOK_MESSENGER} {...props} />
    );

    return (
      <ModalTrigger
        title="Add facebook page"
        autoOpenKey="showFacebookMessengerModal"
        trigger={trigger}
        content={content}
      />
    );
  }

  if (createModal === INTEGRATION_KINDS.FACEBOOK_POST) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => (
      <Facebook kind={INTEGRATION_KINDS.FACEBOOK_POST} {...props} />
    );

    return (
      <ModalTrigger
        title="Add facebook page"
        trigger={trigger}
        content={content}
      />
    );
  }

  if (createModal === 'lead') {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <Lead {...props} />;

    return (
      <ModalTrigger title="Add Pop Ups" trigger={trigger} content={content} />
    );
  }

  if (createModal === 'knowledgeBase') {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <KnowledgeBase {...props} />;

    return (
      <ModalTrigger
        title="Add knowledge base"
        trigger={trigger}
        content={content}
      />
    );
  }

  if (createModal === 'website') {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <Website {...props} />;

    return (
      <ModalTrigger title="Add website" trigger={trigger} content={content} />
    );
  }

  if (createModal === 'callpro') {
    const trigger = <h6>+ {'Add'}</h6>;

    const content = props => <CallPro {...props} />;

    return (
      <ModalTrigger title="Add call pro" trigger={trigger} content={content} />
    );
  }

  if (createModal === 'chatfuel') {
    const trigger = <h6>+ {'Add'}</h6>;

    const content = props => <Chatfuel {...props} />;

    return (
      <ModalTrigger title="Add chatfuel" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.NYLAS_OFFICE365) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <NylasForm kind={createModal} {...props} />;

    return (
      <ModalTrigger
        title="Add Office 365"
        trigger={trigger}
        content={content}
      />
    );
  }

  if (createModal === INTEGRATION_KINDS.NYLAS_IMAP) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <NylasForm kind={createModal} {...props} />;

    return (
      <ModalTrigger title="Add IMAP" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.NYLAS_GMAIL) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <NylasForm kind={createModal} {...props} />;

    return (
      <ModalTrigger title="Add gmail" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.NYLAS_EXCHANGE) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <NylasForm kind={createModal} {...props} />;

    return (
      <ModalTrigger title="Add Exchange" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.NYLAS_OUTLOOK) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <NylasForm kind={createModal} {...props} />;

    return (
      <ModalTrigger title="Add Outlook" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.NYLAS_YAHOO) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <NylasForm kind={createModal} {...props} />;

    return (
      <ModalTrigger title="Add Yahoo" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.GMAIL) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <Gmail {...props} />;

    return (
      <ModalTrigger title="Add gmail" trigger={trigger} content={content} />
    );
  }

  if (createModal === 'twitter') {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <Twitter {...props} />;

    return (
      <ModalTrigger title="Add twitter" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.SMOOCH_LINE) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <LineForm {...props} />;

    return (
      <ModalTrigger title="Add Line" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.SMOOCH_TELEGRAM) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <TelegramForm {...props} />;

    return (
      <ModalTrigger title="Add Telegram" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.SMOOCH_VIBER) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <ViberForm {...props} />;

    return (
      <ModalTrigger title="Add Viber" trigger={trigger} content={content} />
    );
  }

  if (createModal === INTEGRATION_KINDS.SMOOCH_TWILIO) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <TwilioForm {...props} />;

    return (
      <ModalTrigger
        title="Add Twilio SMS"
        trigger={trigger}
        content={content}
      />
    );
  }

  if (createModal === INTEGRATION_KINDS.WHATSAPP) {
    const trigger = <h6>+ {__('Add')}</h6>;

    const content = props => <WhatsappForm {...props} />;

    return (
      <ModalTrigger title="Add WhatsApp" trigger={trigger} content={content} />
    );
  }

  return <Link to={createUrl}>+ {__('Add')}</Link>;
}

function Entry({
  integration,
  getClassName,
  toggleBox,
  messengerAppsCount,
  totalCount
}: Props) {
  const { kind } = integration;

  const boxOnClick = () => toggleBox(kind);

  const { createUrl, createModal } = integration;

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
      {renderCreate(createUrl, createModal)}
    </IntegrationItem>
  );
}

export default Entry;
