import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const LoadingWrapper = styled.div`
  padding: 20px 0 10px 0;
`;

const LoadingItem = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  margin: 0 auto;
  max-width: 100%;
  display: flex;
  align-items: center;

  &.bordered {
    border-bottom: 1px solid ${colors.borderPrimary};
    padding: ${dimensions.coreSpacing}px;
  }
`;

const LoadingTableCircle = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background: ${colors.colorShadowGray};
  flex-shrink: 0;
  margin: auto;

  &.animate {
    animation: pulse 0.5s infinite alternate;
  }
`;

const LoadingItemCircle = styled.div`
  width: ${dimensions.headerSpacing}px;
  height: ${dimensions.headerSpacing}px;
  border-radius: ${dimensions.headerSpacing}%;
  background: ${colors.colorShadowGray};
  margin-right: ${dimensions.coreSpacing}px;

  &.animate {
    animation: pulse 0.5s infinite alternate;
  }
`;

const LineWrapper = styled.div`
  flex: 1;
`;

const Line = styled.div`
  height: 8px;
  margin: 13px 0;
  background: ${colors.colorShadowGray};
  border-radius: 4px;

  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
  &.width40 {
    width: 40%;
  }
  &.width85 {
    width: 85%;
  }
  &.width20 {
    width: 20%;
  }
  &.width65 {
    width: 65%;
  }
  &.width70 {
    width: 70%;
  }
  &.animate {
    animation: pulse 0.5s infinite alternate;
  }
  &.title {
    margin-bottom: ${dimensions.coreSpacing}px;
  }
`;

const FullLoader = styled.div`
  height: 100%;
`;

const TableLine = styled.div`
  height: 8px;
  margin: 13px 0;
  background: ${colors.colorShadowGray};
  border-radius: 4px;
  margin: 5px 0;
  -webkit-transition: width 0.3s ease;
  -moz-transition: width 0.3s ease;
  -ms-transition: width 0.3s ease;
  -o-transition: width 0.3s ease;
  transition: width 0.3s ease;

  &.animate {
    animation: pulse 0.5s infinite alternate;
  }
`;

export {
  LoadingWrapper,
  LoadingItem,
  LoadingItemCircle,
  LoadingTableCircle,
  LineWrapper,
  Line,
  TableLine,
  FullLoader
};
