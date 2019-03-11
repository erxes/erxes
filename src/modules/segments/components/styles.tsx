import { Input, SelectWrapper } from 'modules/common/components/form/styles';
import { colors, dimensions, typography } from 'modules/common/styles';
import { FlexItem } from 'modules/layout/styles';
import styled from 'styled-components';

const SegmentTitle = styled.h3`
  font-size: 12px;
  text-transform: uppercase;
  margin: 0 0 ${dimensions.coreSpacing}px;
`;

const SegmentWrapper = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const ConditionWrapper = styled.div`
  ${SelectWrapper} {
    padding-right: 20px;
  }

  ${SelectWrapper}, ${Input} {
    display: inline-block;
    width: auto;
    vertical-align: middle;
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

const SegmentContainer = styled.div`
  padding-right: ${dimensions.coreSpacing}px;
  border-right: 1px solid ${colors.borderPrimary};
`;

const ConditionItem = styled.div`
  padding: ${dimensions.coreSpacing}px;
  background-color: ${colors.bgLight};
  margin-bottom: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
`;

const SegmentResult = styled(FlexItem)`
  align-self: center;
  text-align: center;
`;

const ResultCount = styled.div`
  font-size: ${typography.fontSizeHeading3}px;

  i {
    color: ${colors.colorShadowGray};
    font-size: ${typography.fontSizeHeading2}px;
  }

  > div {
    display: inline-block;
    height: 30px;
    width: 40px;
  }
`;

export {
  SegmentWrapper,
  ConditionWrapper,
  SegmentTitle,
  SegmentContainer,
  ConditionItem,
  SegmentResult,
  ResultCount
};
