import { colors, dimensions } from 'modules/common/styles';

import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Container = styled.div`
  padding: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px
    ${dimensions.coreSpacing}px;
`;

export const FlexWrapContainer = styled.div`
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

export const ReadMore = styled.a`
  display: flex;
  align-items: center;
  color: ${colors.colorWhite};
  cursor: pointer;

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

export const MoreBtn = styled.div`
  width: 36px;
  height: 36px;
  line-height: 36px;
  border-radius: 36px;
  border: 1px solid ${colors.borderPrimary};
  background: ${colors.bgLight};
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ease 0.3s;
`;

export const ItemBox = styled.div`
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
  cursor: pointer;
  transition: all ease 0.3s;

  > a {
    color: inherit;
  }

  &:hover {
    box-shadow: 0px 16px 24px rgba(0, 0, 0, 0.06),
      0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04);

    ${MoreBtn} {
      background: ${colors.colorSecondary};
      color: ${colors.colorWhite};
    }
  }
`;

export const PluginContent = styled.div`
  > h5 {
    font-weight: 700;
    margin: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px;
  }

  .short-desc {
    height: 40px;
    overflow: hidden;
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  .short-desc,
  p span {
    color: #666;
  }
`;

export const FilterContainer = styledTS<{
  width?: number;
  noPadding?: boolean;
}>(styled.div)`
  padding: ${props => !props.noPadding && '8px'};
  border-radius: ${dimensions.unitSpacing - 2}px;
  border: 1px solid ${colors.borderPrimary};
  flex: ${props => !props.width && 1};
  position: relative;
  width: ${props => props.width && `${props.width}px`};
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;

  > label {
    margin-right: ${dimensions.coreSpacing}px;
  }

  > input {
    border: 0;
    outline: 0;
    width: 100%;
  }
`;

export const Labels = styledTS<{ filteredCategories?: boolean }>(styled.div)`
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 8px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Tag = styledTS<{ isActive?: boolean }>(styled.span)`
  background: ${props =>
    props.isActive ? colors.colorSecondary : colors.bgLight};
  padding: 5px ${dimensions.unitSpacing}px;
  border-radius: 6px;
  color: ${props =>
    props.isActive ? colors.colorWhite : 'rgba(0, 0, 0, 0.62)'};
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  margin-right: ${dimensions.unitSpacing}px;
  transition: all ease 0.3s;

  > i {
    margin-left: 5px;
    cursor: pointer;
  }

  &:hover {
    background: ${rgba(colors.colorSecondary, 0.8)};
    color: ${colors.colorWhite};
  }
`;

export const PluginBoxHeader = styled.div`
  display: flex;
  justify-content: space-between;

  > img {
    max-width: 60px;
    max-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const PluginBoxFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${colors.borderPrimary};
  padding-top: ${dimensions.unitSpacing}px;
`;

export const PerPrice = styled.div`
  display: flex;
  align-items: center;

  h2 {
    font-weight: 900;
    margin: 0;
    color: ${colors.colorSecondary};
  }

  span {
    color: ${colors.colorCoreGray};
    margin-left: 5px;
    width: 40px;
    line-height: 15px;
  }
`;

export const FooterItem = styled.div`
  color: #777;

  i {
    color: #aaa;
    margin-right: 5px;
  }
`;

export const AddOns = styled.div`
  display: flex;
  align-items: center;

  > span {
    text-transform: uppercase;
    font-size: 10px;
    width: 40px;
    margin-right: 5px;
    line-height: 11px;
    font-weight: 500;
  }
`;

export const Addon = styled.div`
  border-radius: 4px;
  background: ${rgba(colors.colorPrimary, 0.1)};
  color: ${colors.colorPrimary};
  display: flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 5px 3px 3px;
  margin-right: 5px;

  > img {
    max-width: 20px;
    max-height: 20px;
    margin-right: 5px;
  }
`;

export const StoreBlock = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;

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

export const EmptyContent = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  padding: ${dimensions.coreSpacing}px;
  flex: 1;
  margin-right: ${dimensions.coreSpacing}px;
`;
