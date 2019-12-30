import { colors, dimensions } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const addition = 2;

const InfoBox = styledTS<{ bordered?: boolean }>(styled.div)`
  min-height: ${dimensions.coreSpacing * 2}px;
  padding: ${dimensions.unitSpacing + 5}px
    ${dimensions.coreSpacing + addition}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  background-color: ${colors.bgActive};
  border-left: ${props =>
    props.bordered && `${addition}px solid ${colors.colorSecondary}`};
  line-height: ${dimensions.coreSpacing + addition}px;
  border-radius: ${props => !props.bordered && `${addition}px`};

  h4 {
    margin-top: ${dimensions.unitSpacing / 2}px;
    margin-bottom: ${dimensions.coreSpacing}px;
  }
`;

type Props = {
  children: React.ReactNode;
  bordered?: boolean;
};

class Info extends React.PureComponent<Props> {
  render() {
    const { children, bordered = true } = this.props;

    return <InfoBox bordered={bordered}>{children}</InfoBox>;
  }
}

export default Info;
