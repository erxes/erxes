import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import MailForm from '../../containers/mail/MailForm';

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  { title: __('Send an email'), link: '/settings/send-email' }
];

function SendEmail() {
  const title = <Title>{__('Send an email')}</Title>;

  return (
    <Wrapper
      center={true}
      shrink={true}
      header={<Wrapper.Header title="Send an email" breadcrumb={breadcrumb} />}
      actionBar={<Wrapper.ActionBar left={title} />}
      content={<MailForm isReply={false} clearOnSubmit={true} />}
    />
  );
}

export default SendEmail;
