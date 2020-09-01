import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import colors from 'modules/common/styles/colors';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const CallTo = styled.a`
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

const statuses = {
  valid: {
    icon: 'shield-check',
    label: 'Valid',
    verified: true
  },
  invalid: {
    icon: 'shield-slash',
    label: 'Invalid',
    verified: false
  },
  receives_sms: {
    icon: 'comment-alt-message',
    label: 'Can receive sms',
    verified: true
  },
  unknown: {
    icon: 'lock',
    label: 'Unknown',
    verified: false
  },
  unverifiable: {
    icon: 'ban',
    label: 'Unverifiable',
    verified: false
  },
  accept_all_unverifiable: {
    icon: 'ban',
    label: 'Unverifiable',
    verified: false
  }
}

function PrimaryPhone({ phone, status }: { phone?: string; status?: string }) {
  const renderStatus = () => {
    if (status && statuses[status]) {
      return (
        <Tip text={`Status: ${statuses[status].label}`} placement="top">
          <Status verified={statuses[status].verified}>
            <Icon icon={statuses[status].icon} />
          </Status>
        </Tip>
      );
    }
    return null;
  };

  return (
    <>
      {phone ? (
        <CallTo href={`tel:${phone}`}>
          {phone}
          {renderStatus()}
        </CallTo>
      ) : (
        '-'
      )}
    </>
  );
}

export default PrimaryPhone;
