import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const ContentBox = styled.div`
  padding: ${coreSpace};
`;

const SubHeading = styled.h4`
  text-transform: uppercase;
  font-weight: 500;
  border-bottom: 1px dotted ${colors.colorShadowGray};
  padding-bottom: ${unitSpace};
  font-size: 12px;
  margin: 0 0 ${coreSpace};
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
    right: ${coreSpace};
    top: ${coreSpace};
  }

  pre {
    border: none;
    background: none;
  }
`;

const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${unitSpace};
  align-items: center;

  > div {
    margin-right: ${unitSpace};
  }
`;

const SubItem = styled.div`
  margin-bottom: ${coreSpace};
`;

const Well = styled.div`
  min-height: ${coreSpace};
  padding: ${coreSpace};
  margin-bottom: ${coreSpace};
  background-color: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};
`;

export { ContentBox, SubHeading, MarkdownWrapper, InlineItems, SubItem, Well };
