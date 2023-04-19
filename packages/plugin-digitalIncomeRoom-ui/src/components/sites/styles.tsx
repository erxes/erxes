import { colors, dimensions } from '@erxes/ui/src/styles';
import styled, { css } from 'styled-components';

import styledTS from 'styled-components-ts';

export const FlexWrap = styledTS<{ noPadding?: boolean }>(styled.div)`
  display: flex;
  flex-wrap: wrap;
  padding: ${props => (props.noPadding ? '0 20px 20px 20px' : '20px')};

  > a,
  > div {
    flex-basis: 240px;
    display: flex;
    flex-shrink: 0;

    @media (min-width: 480px) {
      flex-basis: 33.3333333%;
    }

    @media (min-width: 768px) {
      flex-basis: 25%;
    }

    @media (min-width: 1170px) {
      flex-basis: 20%;
    }

    @media (min-width: 1400px) {
      flex-basis: 240px;
    }
  }
`;

export const SiteBox = styledTS<{ nowrap?: boolean }>(styled.div)`
  flex-basis: 250px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: ${props => !props.nowrap && 1};
  min-height: 200px;
  transition: all ease 0.3s;

  h5 {
    margin: ${dimensions.unitSpacing}px 0 15px;
    font-size: 18px;
    font-weight: bold;
    text-transform: capitalize;
  }

  &:hover {
    box-shadow: 0px 16px 24px rgb(0 0 0 / 6%), 0px 2px 6px rgb(0 0 0 / 4%),
      0px 0px 1px rgb(0 0 0 / 4%);
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
    background: ${colors.colorSecondary};
    color: ${colors.colorWhite};
  }
`;

export const PreviewContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  padding: ${dimensions.headerSpacing}px;
  transition: all ease 0.3s;

  > button {
    margin: 0 0 ${dimensions.unitSpacing}px 0 !important;
    min-width: 140px;
  }
`;

export const SitePreview = styled.div`
  width: 100%;
  height: 300px;
  border-radius: ${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px
    0 0;
  border: 1px solid ${colors.borderPrimary};
  background: #fefefe;
  overflow: hidden;
  position: relative;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    ${PreviewContent} {
      opacity: 1;
    }
  }
`;

export const Content = styled.div`
  background: #f5f5f5;
  padding: ${dimensions.unitSpacing + 2}px ${dimensions.coreSpacing}px;
  border-radius: 0 0 ${dimensions.unitSpacing - 2}px
    ${dimensions.unitSpacing - 2}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(100% - 300px);

  .dropdown {
    margin-left: ${dimensions.unitSpacing}px;

    i {
      cursor: pointer;
    }
  }

  .dropdown-menu {
    a {
      color: ${colors.textPrimary};
    }

    li {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all ease 0.3s;
      padding: 3px ${dimensions.coreSpacing}px;

      &:hover {
        background: ${colors.bgActive};
      }

      > i {
        width: 20px;
      }
    }
  }

  > div {
    display: flex;
    flex-direction: column;

    > b {
      font-size: 14px;
    }

    > span {
      color: ${colors.colorCoreGray};
      font-size: 12px;
      margin-top: 5px;
    }
  }
`;

export const FilterContainer = styledTS<{
  width?: number;
}>(styled.div)`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  flex: ${props => !props.width && 1};
  position: relative;
  width: ${props => props.width && `${props.width}px`};

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

export const LeftSidebar = styledTS<{ width?: number }>(styled.div)`
  overflow: auto;
  height: 100%;
  width: 250px;
  border-right: 1px solid ${colors.colorShadowGray};

  &.darkmode {
    background: #444;
    color: ${colors.colorShadowGray};
    border-right: 0;
  }
`;

export const CollapseLeftMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px ${dimensions.unitSpacing}px;

  > i,
  > div {
    cursor: pointer;
  }
`;

export const SubTitle = styledTS<{ flexBetween?: boolean }>(styled.div)`
  margin: 0;
  letter-spacing: 0.5px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: ${dimensions.unitSpacing}px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
  border-top: 1px solid rgba(0, 0, 0, 0.25);

  &.collapses {
    cursor: pointer;
  }

  > div {
    display: flex;
    align-items: center;
  }

  ${props =>
    props.flexBetween &&
    css`
      display: flex;
      justify-content: space-between;
      align-items: center;
    `}
`;

export const LeftSidebarContent = styled.div`
  padding: 9px ${dimensions.unitSpacing}px;
`;

export const ItemDetailContainer = styled.div`
  border-left: 1px solid rgba(0, 0, 0, 0.25);
  border-right: 1px solid rgba(0, 0, 0, 0.25);
  height: 100%;
`;

export const LeftItem = styled.div`
  width: 50%;
  border-right: 1px solid rgba(0, 0, 0, 0.25);
`;

export const SiteFormContainer = styledTS<{ showDarkMode?: boolean }>(
  styled.div
)`
  position: relative;
  height: 100%;

  ${props =>
    !props.showDarkMode &&
    css`
      .gjs-one-bg {
        background: ${colors.bgLight};
      }

      .gjs-two-color {
        color: ${colors.colorCoreGray};
      }

      .gjs-pn-options {
        border-right: 1px solid ${colors.colorShadowGray};
      }

      .gjs-pn-commands,
      .gjs-pn-views-container {
        box-shadow: none;
      }

      .gjs-block,
      .gjs-category-title,
      .gjs-layer-title,
      .gjs-block-category .gjs-title,
      .gjs-sm-sector-title {
        border-bottom: 1px solid ${colors.borderDarker};
        box-shadow: none;
        background: ${colors.colorWhite};
        font-weight: 500;
      }

      ${SubTitle} {
        border: 1px solid ${colors.borderPrimary};
        background: ${colors.colorWhite};
        color: #666;
      }

      ${ItemDetailContainer} {
        border-left: 1px solid ${colors.borderPrimary};
        border-right: 1px solid ${colors.borderPrimary};
      }

      ${LeftItem} {
        border-right: 1px solid ${colors.borderPrimary};
      }
    `};

    ${props =>
      props.showDarkMode &&
      css`
        label,
        input,
        td,
        th,
        .Select-control,
        .Select-value-label {
          color: ${colors.colorShadowGray} !important;
          border-color: ${colors.colorCoreGray} !important;
        }

        th {
          background-color: #3d3d3d !important;
        }
      `}
  
  .right-section {
    position: relative;
  }
`;

export const SettingsContent = styled.div`
  height: 100%;
  position: absolute;
  left: 249px;
  width: calc(100% - 250px);
  z-index: 10;
`;

export const Editor = styled.div`
  position: relative;
`;

export const CustomButtonWrapper = styled.div`
  position: absolute;
  z-index: 5;
  left: 130px;
  top: 7px;
`;

export const Loader = styledTS<{ showDarkMode?: boolean }>(styled.div)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  opacity: .7;
  background: ${props =>
    props.showDarkMode ? colors.colorCoreDarkGray : colors.colorWhite};
  z-index: 9;

  > div {
    height: 100%;
  }
`;
