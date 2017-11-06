import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';
// import { rgba } from '../common/styles/color';

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const SubHeading = styled.h4`
  text-transform: uppercase;
  font-weight: 500;
  border-bottom: 1px dotted ${colors.colorShadowGray};
  padding-bottom: ${dimensions.unitSpacing}px;
  font-size: 12px;
  margin: 0 0 ${dimensions.coreSpacing}px;
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};

  > div {
    background: none;
  }

  button {
    position: absolute;
    right: 20px;
    top: 20px;
  }

  pre {
    border: none;
    background: none;
  }
`;

export { ContentBox, SubHeading, MarkdownWrapper };
