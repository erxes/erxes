import { colors, dimensions, typography } from 'modules/common/styles';
import { FlexItem } from 'modules/layout/styles';
import styled from 'styled-components';

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
  padding: ${dimensions.coreSpacing}px;
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 4px;
  margin-bottom: 20px;

  img {
    max-height: 170px;
    margin: 30px;
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

export {
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
