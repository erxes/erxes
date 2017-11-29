import styled from 'styled-components';
import { colors, dimensions, typography } from 'modules/common/styles';
import { SelectWrapper, Input } from 'modules/common/components/form/styles';
import { FlexItem } from 'modules/layout/styles';

const SegmentTitle = styled.h3`
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  margin: 0 0 ${dimensions.coreSpacing}px;
`;

const SegmentWrapper = styled.div`
  padding: ${dimensions.coreSpacing}px;
  font-weight: ${typography.fontWeightRegular};
  background: ${colors.colorWhite};
`;

const ConditionWrapper = styled.div`
  & ${SelectWrapper} {
    padding-right: 20px;
  }

  & ${SelectWrapper}, & ${Input} {
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
`;

const SegmentResult = FlexItem.extend`
  align-self: center;
  text-align: center;
`;

const ResultCount = styled.div`
  font-size: ${typography.fontSizeHeading3}px;

  i {
    color: ${colors.colorShadowGray};
    font-size: ${typography.fontSizeHeading2}px;
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
