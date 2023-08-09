import { colors, dimensions, typography } from "../../styles";
import { darken, rgba } from "../../styles/ecolor";
import styled, { css } from "styled-components";

import styledTS from "styled-components-ts";

const silverGrey = "#6c718b";

const Header = styledTS<{ color?: string; backgroundImage?: string }>(
  styled.div
)`
  padding: 30px;
  color: ${colors.colorWhite};
  font-size: ${typography.fontSizeBody};

  background-color: ${(props) =>
    props.color ? props.color : colors.colorWhite};
  background-image: ${(props) =>
    props.backgroundImage && `url(${props.backgroundImage})`};

  h3 {
    font-size: 1.75rem;
    font-weight: ${typography.fontWeightLight};
    padding: 20px 0;
  }
`;

const CategoryItem = styled.div`
  display: flex;
  background-color: ${colors.colorWhite};
  margin-bottom: 16px;
  padding: 24px;
  border: 0;
  box-shadow: 0px 0 15px -10px rgba(0, 0, 0, 0.35);
  border-radius: 5px;
  transition: 0.4s;
  cursor: pointer;

  &:hover {
    box-shadow: 0px 4px 30px -13px rgba(0, 0, 0, 0.25);
    transition: 0.4s;
  }

  align-items: center;
`;

const CategoryIcon = styled.div`
  font-size: 48px;
  color: ${silverGrey};
  text-align: center;
  width: 120px;
  margin-right: 10px;
`;

const CategoryContent = styledTS<{ color?: string }>(styled.div)`
  flex: 1;

  h5 {
    color: ${(props) => props.color || colors.colorSecondary};
    font-weight: ${typography.fontWeightMedium};
    margin: 0 0 2px;
    font-size: 18px;
  }

  p {
    color: ${colors.colorCoreGray};
    margin: 5px 0px 11px;
    text-decoration: none;
    display: block;
    line-height: 1.4;
    font-weight: 300;
  }
`;

const VideoTutorial = styled.div`
  text-align: center;
  margin-top: 50px;

  h4 {
    font-size: ${typography.fontSizeHeading5}px;
    font-weight: ${typography.fontWeightMedium};
  }

  p {
    color: ${silverGrey};
    margin-bottom: 30px;

    a {
      color: ${colors.colorCoreBlue};
    }
  }
`;

const Avatars = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;

  img {
    background: rgb(240, 240, 240);
    border: 1px solid ${colors.borderPrimary};
    margin-left: -12px;
    font-size: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    object-fit: cover;

    &:first-child {
      margin-left: 0;
    }
  }

  &:first-child {
    > img {
      margin-left: 0;
    }
  }

  .avatar-info {
    color: #888;
    margin-left: 10px;
    font-size: 13px;
    flex: 1;
    
    > div {
      width: 250px;
      margin-right: ${dimensions.unitSpacing}px;
    }

    .darker {
      display: inline;
    }

    span {
      color: ${silverGrey};
      margin-left: 5px;
      font-weight: 500;
    }
  }
`;

const CategoryLeft = styled.div``;

const Sidebar = styled.div`
  h6 {
    text-transform: uppercase;
    color: ${silverGrey};
    font-weight: 400;
    font-size: 12px;
  }
`;

const Container = styled.div`
  display: flex;
  margin-bottom: 1px;

  ${CategoryLeft} {
    flex: 0 0 75%;
    max-width: 75%;
    padding-right: 30px;
  }

  ${Sidebar} {
    flex: 0 0 25%;
    max-width: 25%;
  }
`;

const SidebarIcon = styled.div`
  font-size: 20px;
`;

const SidebarContent = styled.div`
  overflow: hidden;
  h6 {
    margin-bottom: 0;
    margin-top: 0.5rem;
    font-weight: 400;
  }

  p {
    font-weight: 300;
    font-size: 14px;
    margin: 0.5rem 0;
  }
`;

const SidebarItem = styledTS<{ active?: boolean }>(styled.div)`
  padding: 2px 10px;
  border-radius: 5px;
  color: ${silverGrey};
  margin: 2px 0;
  cursor: pointer;
  font-size: 14px;
  transition: 0.4s;
  margin-bottom: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #e4eaf0;
    transition: 0.4s;
  }

  ${(props) =>
    props.active &&
    `
      font-weight: 500;
      background: #e4eaf0;
      transition: 0.4s;

      h6 {
        font-weight: 500;
      }
    `}


  ${SidebarIcon} {
    flex: 0 0 18%;
    max-width: 18%;
    height: 100%;
    text-align: center;
  }

  ${SidebarContent} {
    flex: 0 0 82%;
    max-width: 82%;
    flex-wrap: nowrap;
  }
`;

const ArticleWrapper = styled.div`
  padding: 50px 80px;
  border: 0;
  padding: 1.5rem;
  background: ${colors.colorWhite};
  box-shadow: 0px 0 15px -10px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  transition: 0.4s;
  width: 100%;
  height: 100%;
  overflow-x: auto;

  > h4 {
    color: #036;
    font-size: 24px;
    font-weight: 400;
  }

  .content {
    font-size: 14px;
    line-height: 1.8;
    color: #62667a;

    p > img {
      max-width: 100%;
      height: auto !important;
      padding: 10px 0;
      border-radius: 5px;
      border: 1px solid #eee;
      padding: 5px;

      &:hover {
        cursor: zoom-in;
        opacity: 0.7;
      }
    }

    a {
      color: #6569df;
      text-decoration: underline;
    }

    h1 {
      font-size: 25px !important;
    }

    h2 {
      font-size: 22px !important;
    }

    h3 {
      font-size: 20px !important;
    }

    h4 {
      font-size: 18px !important;
    }

    h5 {
      font-size: 16px !important;
    }

    h6 {
      font-size: 15px !important;
    }

    ol,
    ul {
      padding-left: 20px;

      > li > p {
        margin-bottom: 5px !important;
      }
    }
  }
`;

const CategoryListWrapper = styledTS<{
  baseColor?: string;
  linkColor?: string;
  headingColor?: string;
  linkHoverColor?: string;
}>(styled.div)`
  max-width: 1000px;
  margin: 0 auto;

  ${(props) =>
    props.baseColor &&
    css`
      .base-color {
        color: ${props.baseColor} !important;
      }
    `};

  ${(props) =>
    (props.linkColor || props.linkHoverColor) &&
    css`
      .link-color {
        color: ${props.linkColor} !important;
        transition: all ease 0.3s;

        &:hover {
          color: ${props.linkHoverColor
            ? props.linkHoverColor
            : colors.colorSecondary} !important;
        }
      }
    `};

  .categories-wrapper {
    .knowledge-base {
      margin: 20px 0 50px;
    }

    .category-knowledge-list {
      > p {
        color: ${colors.colorCoreGray};
        font-size: 15px;
        margin-bottom: 30px;
      }
    }
    
    .list-category-title {
      font-size: 26px;
      font-weight: 400;
      margin-bottom: 5px;
      text-transform: capitalize;
    }

    .category-col {
      margin-bottom: 30px;
    }

    .category-item {
      height: 100%;

      .icon-wrapper {
        margin-bottom: ${dimensions.unitSpacing}px;
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        border-radius: ${dimensions.unitSpacing}px;
        border: 1px solid ${props => rgba(props.baseColor ? props.baseColor : colors.colorSecondary, 0.08)};
        background: ${props => rgba(props.baseColor ? props.baseColor : colors.colorSecondary, 0.08)};

        i {
          font-size: 18px;
          transition: all ease .3s;
          color: ${(props) =>
            props.baseColor
              ? props.baseColor
              : colors.colorSecondary} !important;
        }
      }

      .tab-content {
        h5 {
          font-size: 16px;
          color: ${colors.textPrimary};
          text-transform: capitalize;
          transition: all ease .3s;
        }
  
        p {
          font-size: 14px;
          color: #6c718b;
          font-weight: 400;
          margin: 0;
        }

        .authors {
          margin-top: ${dimensions.unitSpacing - 2}px;
          font-size: 13px;
          color: #6c718b;

          > span {
            margin-right: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
          }
        }
      }
    }

    .avatars {
      flex-flow: row wrap;
      justify-content: center;

      .avatar-info {
        margin-left: 0;
      }
    }

    .card {
      width: 100%;
      background: ${colors.colorWhite};
      border: 1px solid rgba(60, 72, 88, 0.08);
      box-shadow: 0 0 15px -10px rgba(60, 72, 88, 0.15);
      position: relative;
      min-height: 160px;
      padding: 24px;
      border-radius: 12px;
      animation: all ease 0.5s;
      margin-bottom: 10px;
      
      &:hover {
        box-shadow: 0 4px 30px -13px rgba(60, 72, 88, 0.2);
        transition: 0.4s;
      }

      &:hover > * {
        .tab-content h5 {
          color: ${(props) =>
            props.linkHoverColor ? props.linkHoverColor : props.baseColor ? darken(props.baseColor, .7) :"#6569df"} !important;
        }
      }
    }

    a:hover {
      text-decoration: none;
    }
  }
`;

const SidebarList = styledTS<{ baseColor?: string }>(styled.div)`
  min-height: 60vh;

  .item {
    cursor: pointer;
    font-size: 14px;
    transition: all ease 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    color: #7E8299;

    > div {
      display: flex;
      align-items: center;

      > span {
        width: ${dimensions.coreSpacing}px;
        color: ${colors.colorCoreGray};
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-right: ${dimensions.unitSpacing}px;
      }

      > h6 {
        margin: 0;
        font-size: 14px;
        transition: all ease .3s;
      }

      .icon-wrapper {
        margin-right: ${dimensions.unitSpacing}px;
        width: 30px;
        height: 30px;
        flex-shrink: 0;
        border-radius: ${dimensions.unitSpacing}px;
        border: 1px solid ${props => rgba(props.baseColor ? props.baseColor : colors.colorSecondary, 0.08)};
        background: ${props => rgba(props.baseColor ? props.baseColor : colors.colorSecondary, 0.08)};

        i {
          font-size: 13px;
          transition: all ease .3s;
          color: ${(props) =>
            props.baseColor
              ? props.baseColor
              : colors.colorSecondary} !important;
        }
      }
    }

    > span {
      color: ${colors.colorCoreGray};
      margin-left: 5px;
      font-size: 13px;
    }

    &.active {
      color: ${(props) => (props.baseColor ? props.baseColor : `#6569df`)};

      &:hover {
        h6 {
          color: ${(props) => (props.baseColor ? props.baseColor : `#6569df`)};
        }
      }
    }

    &:hover {
      h6 {
        color: ${colors.textPrimary};
      }
    }
  }
`;

const SubCategories = styledTS<{ baseColor?: string }>(styled.div)`
  margin-bottom: ${dimensions.coreSpacing}px;
  
  .item {
    padding: 4px 0 6px ${dimensions.unitSpacing}px;
    border-radius: ${dimensions.unitSpacing - 2}px;
    margin: 0;

    &.active {
      color: ${props => props.baseColor ? props.baseColor : colors.colorSecondary};
      // background: ${props => rgba(props.baseColor ? props.baseColor : colors.colorSecondary, 0.1)};

      h6, span {
        color: ${props => props.baseColor ? props.baseColor : colors.textPrimary};
      }
    }

    &:hover {
      background: ${colors.bgActive};
    }
    
    > div > i {
      margin-right: 2px !important;
    }
  }
`;

const SubMenu = styled.ul`
  list-style: none;
  padding-left: 10px;
  margin-left: 5px;
  border-left: 1px solid #e1e1e1;

  li {
    font-size: 13px;
    margin-bottom: 8px;
    cursor: pointer;

    &.active {
      color: #6569df;
    }
  }
`;

const Feedback = styled.div`
  .reactions {
    display: flex;
    justify-content: center;

    span {
      margin-right: 10px;
      width: 44px;
      cursor: pointer;

      &.active img,
      img:hover {
        height: 38px;
        width: 38px;
      }

      &.active img {
        box-shadow: 0 3px 8px rgba(101, 105, 223, 0.5),
          0 3px 8px rgba(0, 0, 0, 0.15);
      }

      img {
        height: 34px;
        width: 34px;
        padding: 3px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08), 0 3px 8px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
      }
    }
  }
`;

const PageAnchor = styled.div`
  position: sticky;
  top: 20px;
  padding-top: 10px;

  h6 {
    font-weight: 500;
    text-transform: uppercase;
    font-size: 14px;
  }

  ul {
    margin-top: 10px;
    list-style-type: none;
    padding-left: 20px;
    position: relative;
    height: 100%;

    &::before {
      content: "";
      height: 100%;
      border-left: 2px solid #d6d6d6;
      position: absolute;
      left: 0;
    }

    li {
      position: relative;
      line-height: 17px;
      padding-bottom: 10px;

      h2 {
        line-height: 1.6;
        margin: 0;
        font-size: 14px;
      }

      &::before {
        content: "";
        position: absolute;
        left: -20px;
        height: 100%;
      }

      a {
        font-size: 14px;
        color: #444;
        font-weight: 400;
        transition: all ease 0.3s;

        &:hover {
          text-decoration: none;
        }
      }

      &:hover {
        a {
          font-weight: 500;
        }

        &:before {
          border-left: 2px solid #979797;
        }
      }

      &.active {
        a {
          color: #6569df;
          font-weight: 500;
          position: relative;
        }

        &::before {
          border-left: 2px solid #6569df;
        }
      }
    }
  }
`;

const Modal = styled.div`
  visibility: hidden;
  position: fixed;
  z-index: 1000;
  padding-top: 40px;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(48, 67, 92, 0.8);
  cursor: zoom-out;

  span {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #fff;
    font-size: 40px;
    cursor: pointer;
    transition: all ease 0.3s;
    opacit: 0.8;
  }

  img {
    width: auto;
    max-width: 80%;
    max-height: 80vh;
    box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);
    transition: max-width 0.1s ease, max-height 0.1s ease;
    animation: zoom 0.8s ease-in-out;
  }
`;

export {
  Header,
  CategoryItem,
  CategoryIcon,
  CategoryContent,
  VideoTutorial,
  Avatars,
  CategoryLeft,
  Sidebar,
  Container,
  SidebarList,
  SidebarItem,
  SidebarIcon,
  SidebarContent,
  ArticleWrapper,
  CategoryListWrapper,
  SubCategories,
  SubMenu,
  Feedback,
  PageAnchor,
  Modal,
};
