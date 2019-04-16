import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const collapsibleBackground = '#f8f8f8';
const storeSpace = dimensions.coreSpacing * 2;

const IntegrationWrapper = styled.div`
  padding-bottom: ${storeSpace}px;

  h3 {
    margin: ${storeSpace}px ${storeSpace}px -10px ${storeSpace}px;
  }
`;

const IntegrationRow = styled.div`
  padding-right: ${storeSpace}px;
  display: flex;
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

const Type = styled.span`
  display: block;
  color: ${colors.colorCoreGray};
  padding-top: ${dimensions.coreSpacing - 5}px;
`;

const IntegrationItem = styledTS(styled.div)`
  width: 25%;
  display: flex;
  padding-left: ${storeSpace}px;
  padding-top: ${storeSpace}px;
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

  > a {
    font-weight: 500;
    position: absolute;
    right: 30px;
    top: 70px;
    cursor: pointer;
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
`;

const CollapsibleContent = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
  padding: ${dimensions.coreSpacing}px;
  background: ${collapsibleBackground};
  box-shadow: inset 0px 11px 5px -10px #ddd, inset 0px -11px 5px -10px #ddd;

  img {
    width: 300px;
    padding: 40px 0 20px;
  }

  table thead th {
    background: none;
    position: inherit;
    z-index: 0;
  }
`;

export {
  IntegrationWrapper,
  IntegrationRow,
  IntegrationItem,
  CollapsibleContent,
  Box,
  Type
};
