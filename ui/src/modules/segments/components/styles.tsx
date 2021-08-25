import { colors, dimensions, typography } from 'modules/common/styles';
import { FlexItem } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
  padding: ${dimensions.coreSpacing}px;
`;

const ConditionItem = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  display: flex;
  align-items: center;

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
  height: 500px;
  overflow: auto;
  border: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px;
  margin-top: ${dimensions.unitSpacing}px;
  border-radius: 5px;

  b {
    text-transform: uppercase;
    display: block;
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  p {
    margin-top: ${dimensions.unitSpacing}px;
    font-weight: 500;
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

const ConjunctionButtons = styledTS<{ isGeneral: boolean }>(styled.div)`
  margin-bottom: ${props => props.isGeneral && '40px'};
  margin-top: ${props => props.isGeneral && '40px'};

  button {
    width: 60px !important;
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

export {
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
  SubProperties
};
