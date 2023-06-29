import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import colors from '@erxes/ui/src/styles/colors';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import EmailWidget from '@erxes/ui-inbox/src/inbox/components/EmailWidget';
import { isEnabled } from '@erxes/ui/src/utils/core';

const MailTo = styled.a`
  display: flex;
  align-items: center;

  span {
    margin-left: 5px;
  }
`;

const Status = styledTS<{ verified: boolean }>(styled.span)`
  background: ${props =>
    props.verified ? colors.colorCoreGreen : colors.bgGray};
  color: ${props =>
    props.verified ? colors.colorWhite : colors.textSecondary};
  width: 18px;
  height: 18px;
  text-align: center;
  border-radius: 9px;
  font-size: 11px;
  line-height: 18px;
  margin-left: 5px;
  display: inline-flex;
  justify-content: center;
`;

function PrimaryEmail({
  customerId,
  email,
  status
}: {
  customerId: string;
  email?: string;
  status?: string;
}) {
  const renderStatus = () => {
    if (status) {
      return (
        <Tip text={`Status: ${status}`} placement="top">
          <Status verified={status === 'valid'}>
            <Icon icon={status === 'valid' ? 'shield-check' : 'shield-slash'} />
          </Status>
        </Tip>
      );
    }
    return null;
  };

  const renderEmail = () => {
    return (
      <>
        {email ? (
          <EmailWidget
            buttonStyle={email ? 'primary' : 'simple'}
            emailTo={email}
            buttonSize="small"
            type={`link-${customerId}`}
            emailStatus={renderStatus}
          />
        ) : (
          '-'
        )}
      </>
    );
  };

  if (isEnabled('engages') || isEnabled('imap')) {
    return renderEmail();
  }

  return (
    <MailTo href={`mailto:${email}`}>
      {email}
      {renderStatus()}
    </MailTo>
  );
}

export default PrimaryEmail;
