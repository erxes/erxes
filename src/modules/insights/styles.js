import styled from 'styled-components';
import { colors, dimensions, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const InsightWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const InsightContent = styled.div`
  padding: 0 30px 30px 30px;
  overflow: auto;
`;

const InsightRow = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const InsightFilter = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${colors.bgLight};

  h5 {
    margin-top: 0;
  }
`;

const InsightTitle = styled.h5`
  text-transform: uppercase;
  font-weight: ${typography.fontWeightRegular - 100};
  padding: ${dimensions.unitSpacing}px 0;
  color: ${colors.colorCoreGray};
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px;

  span {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const FlexItem = styled.div`
  flex: 1;
  margin: 0;
  margin-left: ${dimensions.coreSpacing}px;

  &:first-child {
    margin-left: 0;
  }

  .Select-control {
    border-radius: 17px;
  }

  .form-control {
    box-shadow: none;
    border-radius: 30px;
    border-color: ${colors.colorShadowGray};
    padding: 17px 14px;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorPrimary};
    }
  }
`;

const FullLoader = styled.div`
  height: 100%;
`;

const ChartWrapper = styled.div`
  padding: 20px 20px 20px 0;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 4px;
  background: ${colors.bgLight};
`;

const SummaryItem = styled.div`
  text-align: center;
  border-radius: 5px;
  margin-bottom: 30px;
  padding: 12px;
  background: ${colors.bgLight};
  box-shadow: 0 3px 1px -2px ${rgba(colors.colorBlack, 0.12)},
    0 2px 2px 0 ${rgba(colors.colorBlack, 0.12)},
    0 1px 5px 0 ${rgba(colors.colorBlack, 0.12)};
`;

const SummaryTitle = styled.div`
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const SummaryCount = styled.span`
  font-weight: bold;
  font-size: ${typography.fontSizeHeading5}px;
`;

const IntegrationKind = styled.div`
  position: absolute;
  z-index: 2;
  padding-left: ${dimensions.coreSpacing}px;
  margin-top: 60px;
`;

const KindCount = styled.span`
  font-size: ${typography.fontSizeHeading8}px;
  font-weight: bold;
`;

const KindItem = styled.div`
  margin-bottom: 12px;

  .label {
    margin-right: 4px;
    display: inline-block;
    padding: 5px ${dimensions.unitSpacing}px;
  }
`;

const InsightUserData = styled.div`
  margin-bottom: 30px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 4px;

  ${ChartWrapper} {
    padding: 20px 0 10px;
    border: 0;
  }
`;

const UserProfile = styled.div`
  line-height: 40px;
  padding: 15px ${dimensions.coreSpacing}px;
  overflow: hidden;
  max-height: ${dimensions.headerSpacingWide}px;
  border-bottom: 1px solid ${colors.borderPrimary};

  img {
    width: 40px;
    height: 40px;
    border-radius: ${dimensions.headerSpacing}%;
    margin-right: ${dimensions.coreSpacing}px;
    float: left;
  }
`;

const FullName = styled.span`
  float: left;
  font-size: ${typography.fontSizeHeading7 - 1}px;
  font-weight: bold;
`;

export {
  InsightWrapper,
  InsightRow,
  InsightContent,
  InsightFilter,
  InsightTitle,
  FlexItem,
  FlexRow,
  FullLoader,
  ChartWrapper,
  SummaryItem,
  SummaryTitle,
  SummaryCount,
  IntegrationKind,
  KindItem,
  KindCount,
  InsightUserData,
  UserProfile,
  FullName
};
