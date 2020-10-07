import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import MailForm from '../../containers/mail/MailForm';

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  { title: __('Send an email'), link: '/settings/send-email' }
];

function SendEmail() {
  return (
    <Wrapper
      center={true}
      header={<Wrapper.Header title="Send an email" breadcrumb={breadcrumb} />}
      content={<MailForm isReply={false} clearOnSubmit={true} />}
    />
  );
}

export default SendEmail;
