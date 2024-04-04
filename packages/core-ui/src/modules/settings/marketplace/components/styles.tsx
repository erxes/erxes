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

export const Services = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const Description = styledTS<{ showmore: boolean }>(styled.div)`
  color: #666;
  margin-top: ${dimensions.unitSpacing}px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: ${props => !props.showmore && '3'};
  -webkit-box-orient: vertical;
  position: relative;
  transition: all ease .3s;

  ul {
    padding-inline-start: ${dimensions.unitSpacing + 5}px;

    li {
      margin-bottom: ${dimensions.unitSpacing}px;
    }
  }
`;

export const ServiceText = styledTS<{ showMore: boolean }>(styled.div)`
  position: relative;

  > span {
    position: absolute;
    right: 0;
    bottom: 0;
    color: #888;
    font-size: 14px;
    width: 20px;
    height: 20px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eee;
    border: 1px solid #ddd;
    cursor: pointer;
    transition: all ease 0.3s;
    z-index: 999;

    i {
      transform: ${props => props.showMore && 'rotate(180deg)'};
    }

    &:hover {
      box-shadow: 0px 16px 24px rgb(0 0 0 / 6%), 0px 2px 6px rgb(0 0 0 / 4%),
        0px 0px 1px rgb(0 0 0 / 4%);
    }
  }
`;

export const Service = styled.a`
  width: 31.66666%;
  flex-shrink: 0;
  color: ${colors.textPrimary};
  padding: ${dimensions.coreSpacing}px 30px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-height: 200px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all ease 0.3s;
  background: #f1f3f5;

  h5 {
    font-size: 15px;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: ${dimensions.unitSpacing}px 0;
  }

  &:before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-image: url('/images/patterns/pn-1.svg');
    background-repeat: no-repeat;
    opacity: 0.2;
  }

  &:nth-child(3n + 1) {
    &:before {
      background-position: center;
    }
  }

  &:nth-child(3n + 2) {
    &:before {
      background-position: left top;
    }
  }

  &:nth-child(3n + 3) {
    &:before {
      background-position: right center;
    }
  }

  &:hover {
    box-shadow: 0px 16px 24px rgb(0 0 0 / 6%), 0px 2px 6px rgb(0 0 0 / 4%),
      0px 0px 1px rgb(0 0 0 / 4%);
  }
`;

export const Price = styled.div`
  font-size: 30px;
  font-weight: 800;
  display: flex;
  align-items: baseline;

  span {
    font-size: 14px;
    font-weight: 300;
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
  flex-shrink: 0;
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

  > .image-wrapper {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;

    > img {
      max-width: 60px;
      max-height: 60px;
    }
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
  flex-wrap: wrap;

  > a {
    border: 0 !important;
    padding: 0 !important;
    margin: 5px 5px 5px 0 !important;
  }

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
  margin: 0 0 5px 5px;

  > img {
    max-width: 20px;
    max-height: 20px;
    margin-right: 5px;
  }
`;

export const StoreBlock = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;

  > h4 {
    margin: ${dimensions.unitSpacing}px 0 0;
    font-size: ${dimensions.coreSpacing}px;
  }

  > p {
    color: ${colors.colorCoreGray};
    font-size: 14px;
    margin: ${dimensions.unitSpacing - 5}px 0 ${dimensions.coreSpacing}px 0;
  }
`;

export const EmptyContent = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  padding: ${dimensions.coreSpacing}px;
  flex: 1;
  margin-right: ${dimensions.coreSpacing}px;
`;

export const SearchInput = styled.input`
  flex: 1;
  border: none;
  width: 0px;
  transition: width 1s;

  &:focus-visible {
    outline: none !important;
  }
`;

export const SearchBar = styled(FilterContainer)`
  &:hover {
    ${SearchInput} {
      width: 295px;
    }
  }
`;

export const SearchIcon = styled.div`
  margin: 4px 6px;
`;

export const PluginCategories = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
