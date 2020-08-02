import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { Contents } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const collapsibleBackground = '#f8f8f8';

const IntegrationWrapper = styled.div`
  padding-bottom: ${dimensions.coreSpacing * 1.5}px;
  flex: 1;

  h3 {
    margin: 30px 0 0 ${dimensions.coreSpacing}px;
  }
`;

const IntegrationRow = styled.div`
  padding-right: ${dimensions.coreSpacing}px;
  display: flex;
  flex-wrap: wrap;
`;

const Box = styledTS<{ isInMessenger: boolean }>(styled.div)`
  padding: 30px;
  padding-bottom: ${props => props.isInMessenger && '20px'};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  flex: 1;
  transition: all ease 0.3s;
  position: relative;

  &:hover {
    cursor: pointer;
    border-color: ${colors.colorCoreTeal};
  }
`;

const Ribbon = styled.div`
  overflow: hidden;
  position: absolute;
  right: -5px;
  top: -5px;
  width: 100px;
  height: 100px;

  span {
    position: absolute;
    width: 130px;
    color: ${colors.colorWhite};
    font-size: ${dimensions.unitSpacing}px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    line-height: ${dimensions.coreSpacing + 5}px;
    transform: rotate(45deg);
    background: linear-gradient(
      ${colors.colorPrimary} 0%,
      ${colors.colorSecondary} 100%
    );
    box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
    top: 25px;
    right: -27px;

    &:before {
      content: '';
      position: absolute;
      left: 0px;
      top: 100%;
      border-left: 3px solid ${colors.colorPrimary};
      border-right: 3px solid transparent;
      border-bottom: 3px solid transparent;
      border-top: 3px solid ${colors.colorPrimary};
    }

    &:after {
      content: '';
      position: absolute;
      right: 0px;
      top: 100%;
      border-left: 3px solid transparent;
      border-right: 3px solid ${colors.colorPrimary};
      border-bottom: 3px solid transparent;
      border-top: 3px solid ${colors.colorPrimary};
    }
  }
`;

const Type = styled.span`
  display: block;
  color: ${colors.colorCoreGray};
  padding-top: ${dimensions.coreSpacing - 5}px;
`;

const IntegrationItem = styled.div`
  width: 25%;
  display: flex;
  padding-left: ${dimensions.coreSpacing}px;
  padding-top: ${dimensions.coreSpacing}px;
  position: relative;

  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  h5 {
    margin-top: ${dimensions.coreSpacing}px;

    span {
      font-size: 80%;
      color: ${colors.colorCoreGray};
    }

    > i {
      color: ${colors.colorCoreGray};
      margin-left: 5px;
    }
  }

  p {
    margin: 0;
  }

  > a,
  button {
    font-weight: 500;
    font-size: 15px;
    color: ${colors.linkPrimary};
    position: absolute;
    right: 30px;
    top: 55px;
    cursor: pointer;
    background: none;
    outline: 0;
    border: none;

    :hover {
      text-decoration: underline;
      opacity: 0.9;
    }
  }

  &.active {
    ${Box} {
      border-color: ${colors.colorCoreTeal};
      box-shadow: 0 2px 15px 0 ${rgba(colors.colorCoreDarkGray, 0.1)};
    }

    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -10px;
      border-left: ${dimensions.coreSpacing}px solid transparent;
      border-right: ${dimensions.coreSpacing}px solid transparent;
      border-bottom: ${dimensions.coreSpacing}px solid #e8e8e8;
    }
  }

  @media (max-width: 1400px) {
    padding-left: ${dimensions.coreSpacing}px;
    padding-top: ${dimensions.coreSpacing}px;
  }
`;

const CollapsibleContent = styled.div`
  margin: ${dimensions.coreSpacing}px 0 0 ${dimensions.coreSpacing}px;
  padding: 10px 0 20px 10px;
  background: ${collapsibleBackground};
  box-shadow: inset 0px 11px 5px -10px ${colors.colorShadowGray},
    inset 0px -11px 5px -10px ${colors.colorShadowGray};

  img {
    width: 300px;
    padding: 40px 0 20px;
  }

  table thead th {
    background: none;
    position: inherit;
    z-index: 0;
  }

  table td {
    background: none;
  }
`;

const Content = styled(Contents)`
  padding-left: ${dimensions.unitSpacing}px;
`;

const Category = styledTS<{ isActive?: boolean }>(styled.li)`
  margin-bottom: ${dimensions.unitSpacing - 5}px;
  transition: all ease 0.3s;
  cursor: pointer;
  color: ${props => props.isActive && colors.colorPrimary};
  font-weight: ${props => props.isActive && 500};

  &:hover {
    color: ${colors.colorPrimary};
  }
`;

const SidebarList = styled.ul`
  margin: 0;
  padding: ${dimensions.unitSpacing}px 0;
  list-style: none;

  a {
    color: ${colors.textPrimary};
  }

  h4 {
    margin-bottom: ${dimensions.coreSpacing - 5}px;
  }
`;

const LeftSidebar = styled.div`
  width: 200px;
  position: relative;
  margin: 10px;
`;

const FixedSection = styled.div`
  position: fixed;
  width: 200px;
  top: 220px;
  bottom: ${dimensions.coreSpacing}px;
  transition: all ease 0.5s;
  overflow-y: hidden;

  &:hover {
    overflow-y: scroll;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 5px;
  }
`;

const SearchInput = styled.div`
  position: relative;

  input {
    border: 1px solid ${colors.borderPrimary};
    padding: 20px 20px 20px 30px;
    border-radius: 5px;
    min-width: 500px;
    background: ${colors.colorWhite};

    @media (max-width: 1300px) {
      min-width: 300px;
    }
  }

  i {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 15px;
    color: ${colors.colorCoreGray};
  }
`;

const FullHeight = styled.div`
  height: 100%;
`;

export {
  IntegrationWrapper,
  IntegrationRow,
  IntegrationItem,
  CollapsibleContent,
  Box,
  Type,
  Content,
  Category,
  SidebarList,
  LeftSidebar,
  FixedSection,
  SearchInput,
  Ribbon,
  FullHeight
};
