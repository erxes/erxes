import EmailWidget from '@erxes/ui-inbox/src/inbox/components/EmailWidget';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import colors from '@erxes/ui/src/styles/colors';
import { isEnabled } from '@erxes/ui/src/utils/core';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
  status,
  showDefault
}: {
  customerId: string;
  email?: string;
  status?: string;
  showDefault?: boolean;
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

  if (!showDefault && (isEnabled('engages') || isEnabled('imap'))) {
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
  }

  return (
    <>
      {email ? (
        <MailTo href={`mailto:${email}`}>
          {email}
          {renderStatus()}
        </MailTo>
      ) : (
        '-'
      )}
    </>
  );
}

export default PrimaryEmail;
