import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import colors from 'modules/common/styles/colors';
import React from 'react';
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
`;

function PrimaryEmail({ email, status }: { email?: string; status?: string }) {
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
