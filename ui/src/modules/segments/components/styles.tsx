import { colors, dimensions, typography } from 'modules/common/styles';
import { FlexItem } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { GroupWrapper } from 'modules/automations/components/forms/actions/styles';

const SegmentTitle = styled.h3`
  font-size: 12px;
  text-transform: uppercase;
  margin: 0 0 ${dimensions.coreSpacing}px;

  a {
    text-transform: none;
    margin-left: 30px;

    i {
      margin-right: 5px;
    }
  }
`;

const SegmentWrapper = styled.div`
  padding: ${dimensions.unitSpacing}px;
`;

const ConditionItem = styledTS<{ useMargin: boolean }>(styled.div)`
  margin-bottom: ${dimensions.unitSpacing - 5}px;
  margin-left: ${props => props.useMargin && '30px'};

  i{
    cursor: pointer;
    color: ${colors.colorCoreGray};
  }
`;

const ConditionRemove = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  button.round {
    padding: 4px 8px;
    margin-left: 20px;
  }
`;

const SegmentResult = styled(FlexItem)`
  align-self: center;
  text-align: center;
`;

const ResultCount = styled.div`
  font-size: ${typography.fontSizeHeading3}px;

  i {
    color: ${colors.colorLightGray};
    font-size: ${typography.fontSizeHeading2}px;
  }

  > div {
    display: inline-block;
    height: 30px;
    width: 40px;
  }
`;

const FilterBox = styled.div`
  overflow: auto;
  border: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px;
  margin: ${dimensions.unitSpacing}px 0;
  border-radius: 5px;
  position: relative;

  b {
    text-transform: uppercase;
    display: block;
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  p {
    margin-top: ${dimensions.unitSpacing}px;
    font-weight: 500;
  }

  label {
    display: block;
  }
`;

const FilterRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const FilterProperty = styled.div`
  max-width: 30%;
  flex: 1;
  margin-right: 20px;
`;

const SubProperties = styled.div`
  padding-left: 40px;
`;

const ConjunctionButtons = styled.div`
  position: absolute;
  left: calc(100% - 60%);
  top: -40px;

  button {
    text-transform: uppercase;
  }
`;

const ConjunctionButtonsVertical = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);

  button {
    display: block;
    padding: 10px 5px;
    border-radius: 0 10px 0 0 !important;
    width: 25px;

    &:last-child {
      border-radius: 0 0 10px 0 !important;
    }

    span {
      display: block;
      transform: rotate(270deg);
    }
  }
`;

const AddSegmentButton = styled.div`
  margin-top: 40px;
`;

const OperatorList = styled.div`
  label {
    display: block;
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  p {
    margin-top: ${dimensions.unitSpacing}px;
  }

  p:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const SegmentBackIcon = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: ${dimensions.unitSpacing}px 0;
  font-weight: 500;

  > i {
    width: 20px;
    height: 20px;
    border-radius: 20px;
    line-height: 20px;
    text-align: center;
    margin-right: ${dimensions.unitSpacing - 5}px;
    color: ${colors.colorPrimary};
    transition: all ease 0.3s;
  }

  &:hover {
    i {
      box-shadow: 0 0 2px 0 rgba(101, 105, 223, 0.4);
    }
  }
`;

const Condition = styledTS<{ hasCondition: boolean }>(styled.div)`
  overflow: auto;
  padding: 0 ${dimensions.unitSpacing}px;
  position: relative;

  b {
    text-transform: uppercase;
    display: block;
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  p {
    margin-top: ${dimensions.unitSpacing}px;
    font-weight: 500;
  }

  label {
    display: block;
  }

  > button {
    margin: ${props => !props.hasCondition && '10px 0 10px 30px'};
  }
`;

const ConditionDetailText = styled.p`
  span:first-child {
    text-transform: capitalize;
  }

  span:last-child {
    text-transform: lowercases;
    color: #3c2880;
  }
`;

const PropertyText = styled.span`
  color: #ffc82c;
  text-transform: lowercase;
  text-decoration: underline;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const ConditionGroup = styled(GroupWrapper)`
  padding: 10px 10px 10px 0;
  margin-bottom: ${dimensions.headerSpacing}px;
`;

export {
  PropertyText,
  ConditionDetailText,
  ConjunctionButtonsVertical,
  Condition,
  SegmentBackIcon,
  ConditionRemove,
  OperatorList,
  AddSegmentButton,
  ConjunctionButtons,
  SegmentWrapper,
  SegmentTitle,
  ConditionItem,
  SegmentResult,
  ResultCount,
  FilterBox,
  FilterRow,
  FilterProperty,
  SubProperties,
  ConditionGroup
};
