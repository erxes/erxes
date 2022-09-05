import { colors, dimensions } from 'modules/common/styles';

import styled from 'styled-components';

export const Container = styled.div`
  padding: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px
    ${dimensions.coreSpacing}px;

  > h4 {
    margin: 0;
    font-size: ${dimensions.coreSpacing}px;
  }

  > p {
    color: ${colors.colorCoreGray};
    font-size: 14px;
    margin: ${dimensions.unitSpacing}px 0;
  }
`;

export const Services = styled.div`
  display: flex;
  flex-wrap: wrap;

  > a,
  > div {
    flex-basis: 20%;
    display: flex;
    flex-shrink: 0;

    @media (min-width: 480px) {
      flex-basis: 50%;
    }

    @media (min-width: 768px) {
      flex-basis: 33.3333333%;
    }

    @media (min-width: 1170px) {
      flex-basis: 25%;
    }

    @media (min-width: 1400px) {
      flex-basis: 20%;
    }
  }
`;

export const ReadMore = styled.div`
  display: flex;
  align-items: center;

  > span {
    width: 0%;
    font-weight: bold;
    white-space: nowrap;
    transition: width 0.5s ease-in-out;
    overflow: hidden;
  }

  > i:before {
    font-weight: 900;
  }
`;

export const Service = styled.div`
  flex-basis: 300px;
  padding: ${dimensions.coreSpacing}px 30px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  flex: 1;
  min-height: 200px;
  border: 1px solid ${colors.borderPrimary};
  color: ${colors.colorWhite};
  cursor: pointer;
  transition: all ease 0.3s;

  h5 {
    margin: ${dimensions.unitSpacing}px 0 15px;
    font-size: 18px;
    font-weight: bold;
    text-transform: capitalize;
  }

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 28px;
    width: 4px;
    height: 30px;
    background: ${colors.colorWhite};
  }

  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    width: 175px;
    height: 220px;
    border-radius: 16px;
    transform: rotate(-150deg);
  }

  &:nth-child(1) {
    background: linear-gradient(118.62deg, #f42251 1.08%, #ec6535 101.09%);

    &:after {
      right: -85px;
      top: -40px;
      background: linear-gradient(180deg, #f42451 0%, #ea4111 100%);
    }
  }

  &:nth-child(2) {
    background: linear-gradient(112.98deg, #7919f6 1.84%, #3584ed 100%);

    &:after {
      right: -70px;
      top: -140px;
      background: linear-gradient(180deg, #e537ec 0%, #7260ea 100%);
    }
  }

  &:nth-child(3) {
    background: linear-gradient(117.96deg, #00c3fb 0%, #0060eb 98.73%);

    &:after {
      left: -20px;
      bottom: -120px;
      background: linear-gradient(180.96deg, #0070ee 0.82%, #0094f4 105.38%);
    }
  }

  &:nth-child(4) {
    background: linear-gradient(117.5deg, #179b8d 0%, #add268 100%);

    &:after {
      left: -20px;
      bottom: -80px;
      background: linear-gradient(180deg, #97ca6c 0%, #79c074 100%);
      width: 200px;
      height: 200px;
      border-radius: 200px;
    }
  }

  &:hover {
    box-shadow: 0px 16px 24px rgb(0 0 0 / 6%), 0px 2px 6px rgb(0 0 0 / 4%),
      0px 0px 1px rgb(0 0 0 / 4%);

    ${ReadMore} > span {
      width: 30%;
      margin-right: 5px;
    }
  }
`;

export const Price = styled.div`
  font-size: 30px;
  font-weight: 900;
  display: flex;
  align-items: center;

  span {
    font-size: 14px;
    font-weight: 400;
    opacity: 0.9;
    padding-left: 5px;
  }
`;

export const SubService = styled.div`
  width: 50%;
  float: left;
`;
