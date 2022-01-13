// import { PageHeader } from '@erxes/ui/src/boards/styles/header';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Contents, MainContent } from '@erxes/ui/src/layout/styles';

// modules/boards/styles/header in *styles.ts
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px ${dimensions.coreSpacing}px 2px;
  background: ${colors.colorWhite};
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  z-index: 2;
  @media (max-width: 768px) {
    min-height: auto;
    flex-direction: column;
  }
`;

const Header = styled(PageHeader)`
  min-height: auto;
`;

const Title = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  margin-top: 7px;

  i {
    font-size: 22px;
    color: ${colors.colorCoreGray};
    margin: 5px 0 0 ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
  }
`;

const RightActions = styled.div`
  align-self: center;

  a {
    margin-left: ${dimensions.unitSpacing}px;
  }

  button {
    margin: ${dimensions.unitSpacing}px 0;
  }
`;

const Dashboards = styled.ul`
  padding: 0;
  min-width: 280px;
  max-height: 75vh;
  overflow: auto;
  margin: -8px 0 0 0;

  > li {
    border-color: rgba(0, 0, 0, 0.06);

    button {
      font-size: 14px;
      padding: 0;
      margin-left: 5px;

      i {
        color: ${colors.colorSecondary};
      }
    }

    > a {
      padding: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px 20px;
      white-space: normal;

      &:hover {
        background: transparent;
      }
    }

    &:hover {
      background: ${rgba(colors.colorPrimary, 0.1)};
    }
  }
`;

const Create = styled.div`
  padding: 8px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: -8px;
  font-weight: 500;
  color: ${colors.colorSecondary};

  &:hover {
    cursor: pointer;
    background: ${rgba(colors.colorPrimary, 0.1)};
  }
`;

const SelectMemberStyled = styledTS<{ zIndex?: number }>(styled.div)`
  position: relative;
  z-index: ${props => (props.zIndex ? props.zIndex : '2001')};
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

export const BoardContainer = styled(Contents)`
  margin: 0;
  position: unset;
  > div {
    padding-left: 20px;
  }
`;

export const BoardContent = styledTS<{
  bgColor?: string;
  transparent?: boolean;
}>(styled(MainContent))`
  margin: 0;
  background-color: ${({ bgColor, transparent }) =>
    transparent ? 'transparent' : bgColor || colors.colorSecondary};
`;

export { Title, RightActions, Dashboards, Create, Header, SelectMemberStyled, ActionButtons, SidebarListItem };
