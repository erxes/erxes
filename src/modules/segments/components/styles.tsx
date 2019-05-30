import { Input, SelectWrapper } from 'modules/common/components/form/styles';
import { colors, dimensions, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
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

const Field = styled.div`
  visibility: hidden;
  position: absolute;
  left: ${dimensions.headerSpacing + dimensions.headerSpacing}%;
  top: 0;
  width: 260px;
  background: ${colors.colorWhite};
  box-shadow: 0 0 ${dimensions.coreSpacing}px 3px rgba(0, 0, 0, 0.15);
  padding: 0;
  margin: 0;

  input {
    transition: inherit;
    width: 100% !important;
  }
`;

const FieldType = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  color: ${rgba(colors.textPrimary, 0.8)};

  &:hover {
    background: ${colors.bgLight};
  }
`;

const PopoverList = styled.div`
  position: relative;
  list-style: none;

  &:hover {
    > ${Field} {
      visibility: visible;
    }
  }
`;

export {
  SegmentWrapper,
  ConditionWrapper,
  SegmentTitle,
  SegmentContainer,
  ConditionItem,
  SegmentResult,
  ResultCount,
  PopoverList,
  FieldType,
  Field
};
