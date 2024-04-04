import { colors, dimensions, SidebarList } from '@erxes/ui/src';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const CarsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CarLogo = styled.div`
  width: ${dimensions.headerSpacing}px;
  height: ${dimensions.headerSpacing}px;
  border-radius: 25px;
  margin-right: ${dimensions.coreSpacing}px;
  background: ${colors.colorSecondary};
`;

const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    i {
      margin-left: ${dimensions.unitSpacing / 2}px;
    }

    &:last-child {
      border: none;
    }
  }
`;

const FlexItem = styled.div`
  display: flex;
  align-items: center;
`;

const ChooseColor = styled.div`
  width: 260px;
`;

const BackgroundSelector = styledTS<{ selected?: boolean }>(styled.li)`
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  padding: ${dimensions.unitSpacing / 2}px;
  margin-right: ${dimensions.unitSpacing / 2}px;
  border: 1px solid
    ${props => (props.selected ? colors.colorShadowGray : 'transparent')};

  > div {
    height: ${dimensions.headerSpacing - 20}px;
    width: ${dimensions.headerSpacing - 20}px;
    background: ${colors.borderPrimary};
    border-radius: 50%;
    text-align: center;
    line-height: ${dimensions.headerSpacing - 20}px;

    > i {
      visibility: ${props => (props.selected ? 'visible' : 'hidden')};
      font-size: ${dimensions.unitSpacing}px;
      color: ${colors.colorWhite};

      &:before {
        font-weight: 700;
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;
  width: 0;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${props => props.isActive && colors.bgActive};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;

  a {
    white-space: normal;
    flex: 1;
    padding: 10px 0 10px 20px;
    font-weight: 500;

    &:hover {
      background: none;
    }

    &:focus {
      color: inherit;
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const Name = styledTS<{ fontSize?: number }>(styled.div)`
  font-size: ${props => props.fontSize && `${props.fontSize}px`};
  font-weight: 500;

  i {
    margin-left: 10px;
    transition: all 0.3s ease;
    color: ${colors.colorCoreLightGray};

    &:hover {
      cursor: pointer;
      color: ${colors.colorCoreGray};
    }
  }
`;

const Info = styled.div`
  margin-top: 5px;
  white-space: normal;

  > span {
    font-weight: normal;
  }
`;

const InfoTitle = styled.span`
  font-weight: 500;
  margin-bottom: 5px;
  margin-right: 10px;
`;

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
`;

const Description = styled.div`
  padding: 12px 22px;
  word-break: break-word;
  background: ${colors.bgLight};
  margin: 10px;
  border-radius: 3px;
  min-height: 50px;

  p {
    color: ${colors.textPrimary};
    font-size: 13px;
  }
`;

export {
  InfoTitle,
  InfoDetail,
  Info,
  Action,
  Name,
  CarsTableWrapper,
  CarLogo,
  List,
  FlexItem,
  ChooseColor,
  BackgroundSelector,
  ActionButtons,
  SidebarListItem,
  Description
};
