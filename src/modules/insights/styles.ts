import { colors, dimensions, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { BoxRoot } from 'modules/common/styles/main';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export interface IWrapperProps {
  height?: number;
}

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
  padding: 30px;
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
  font-weight: ${typography.fontWeightRegular};
  padding: ${dimensions.unitSpacing}px 0;
  margin: 0 0 ${dimensions.unitSpacing}px;

  span {
    margin-left: ${dimensions.unitSpacing}px;
    text-transform: lowercase;
    font-size: 13px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Row = styled(FlexRow)`
  align-items: normal;
  flex-wrap: wrap;
  margin-left: -1%;
  margin-right: -1%;
`;

const FlexItem = styled.div`
  flex: 1;
  margin: 0;
  margin-left: ${dimensions.coreSpacing}px;

  &:first-child {
    margin-left: 0;
  }

  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 5px 0;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }
`;

const ChartWrapper = styledTS<IWrapperProps>(styled.div)`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  background: ${colors.bgLight};
  width: 100%;
  height: ${props => (props.height ? `${props.height}px` : 'auto')}
  position: relative;
  overflow: hidden;
`;

const LoaderWrapper = styled(ChartWrapper)`
  padding: ${dimensions.coreSpacing * 2}px;
`;

const SummaryTitle = styled.div`
  margin-bottom: 10px;
  text-transform: uppercase;

  span {
    text-transform: lowercase;
  }
`;

const SummaryCount = styled.span`
  font-weight: bold;
  font-size: ${typography.fontSizeHeading5}px;

  > span {
    font-size: 14px;
    padding-left: ${dimensions.unitSpacing - 5}px;
    font-weight: normal;
  }
`;

const SummaryItem = styledTS<{ isSmall?: boolean }>(styled.div)`
  border-radius: 5px;
  margin: 0 1% 2% 1%;
  padding: 15px 20px;
  flex: 1;
  flex-basis: 23%;
  flex-grow: 0;
  background: ${colors.bgLight};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 3px 15px 0 ${rgba(colors.colorBlack, 0.2)};

  ${props =>
    props &&
    props.isSmall &&
    `
    padding: 8px;
    line-height: ${typography.fontSizeHeading7}px;

    > span {
      font-size: ${typography.fontSizeHeading7}px!important;
    }
  `}
`;

const InsightUserData = styled.div`
  margin-bottom: 30px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;

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

const BoxContainer = styled.div`
  width: 1020px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const Box = styledTS<{ selected?: boolean }>(styled(BoxRoot))`
  width: 30%;
  border: ${props => props.selected && `1px solid ${colors.colorSecondary}`};
  margin: 10px;
  flex-shrink: 0;

  > a {
    padding: 40px;
  }

  span {
    font-weight: 500;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
  }
`;

const PunchCardWrapper = styledTS<{ paddingLeft: number }>(styled.div)`
  padding-left: ${props => props.paddingLeft}px;
`;

const PunchCell = styledTS<{ height: number }>(styled.div)`
  width: ${100 / 24}%;
  height: ${props => props.height}px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PunchCircle = styledTS<{ radius: number }>(styled.div)`
  display: inline-block;
  border-radius: 50%;
  background-color: ${colors.colorPrimary};
  width: ${props => props.radius}px;
  height: ${props => props.radius}px;
  text-indent: -9999px;
  white-space: nowrap;
  cursor: pointer;
`;

const PunchDates = styledTS<{ width: number }>(styled.div)`
  position: absolute;
  width: ${props => props.width}px;
  left: 0;
  border-right: 1px solid ${colors.colorCoreGray};

  ${PunchCell} {
    width: 100%;
    position: relative;

    &:before {
      content: "";
      height: 2px;
      width: 5px;
      background-color: ${colors.colorCoreGray};
      position: absolute;
      right: 0;
    }
  }
`;

const PunchHours = styled.div`
  margin-top: 10px;
  border-top: 1px solid ${colors.colorCoreGray};

  ${PunchCell} {
    &:before {
      content: '';
      height: 5px;
      width: 2px;
      background-color: ${colors.colorCoreGray};
      position: absolute;
      left: 50%;
      top: 0;
    }
  }
`;

export {
  InsightWrapper,
  InsightRow,
  InsightContent,
  InsightFilter,
  InsightTitle,
  FlexItem,
  FlexRow,
  LoaderWrapper,
  ChartWrapper,
  SummaryItem,
  SummaryTitle,
  SummaryCount,
  InsightUserData,
  UserProfile,
  FullName,
  BoxContainer,
  Box,
  PunchCell,
  PunchCircle,
  PunchDates,
  PunchCardWrapper,
  PunchHours,
  Row
};
