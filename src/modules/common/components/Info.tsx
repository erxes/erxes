import { colors, dimensions } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';

const addition = 2;

const InfoBox = styled.div`
  min-height: ${dimensions.coreSpacing * 2}px;
  padding: ${dimensions.unitSpacing + 5}px
    ${dimensions.coreSpacing + addition}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  background-color: ${colors.bgActive};
  border-left: ${addition}px solid ${colors.colorSecondary};
  line-height: ${dimensions.coreSpacing + addition}px;
`;

type Props = {
  children: React.ReactNode;
};

class Info extends React.PureComponent<Props> {
  render() {
    const { children } = this.props;

    return <InfoBox>{children}</InfoBox>;
  }
}

export default Info;
