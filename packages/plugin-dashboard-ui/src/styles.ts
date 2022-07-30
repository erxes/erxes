import { PageHeader } from '@erxes/ui-cards/src/boards/styles/header';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { Contents, FlexContent } from '@erxes/ui/src/layout/styles';

const Header = styled(PageHeader)`
  min-height: auto;
`;

const Title = styled(FlexContent)`
  transition: all ease 0.3s;
  padding: 0 ${dimensions.unitSpacing}px;
  border-radius: 4px;

  input {
    border: 0;
    font-size: 16px;
  }

  i {
    visibility: hidden;
  }

  &:hover {
    background: ${colors.bgActive};

    i {
      visibility: visible;
    }
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

const EmptyContent = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > img {
    width: 300px;
  }

  p {
    text-align: center;
    max-width: 400px;

    b {
      margin: ${dimensions.unitSpacing}px 0;
      display: block;
    }
  }
`;

const AutomationFormContainer = styled(Contents)`
  margin: 0;

  > section {
    margin: 0;
  }
`;

const BackButton = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 35px;
  line-height: 35px;
  background: rgba(0, 0, 0, 0.12);
  text-align: center;
  margin-right: ${dimensions.unitSpacing}px;
  color: ${colors.textPrimary};
  transition: all ease 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.18);
  }
`;

const ActionBarButtonsWrapper = styled.div`
  @media (max-width: 1450px) {
    max-width: 350px;
    white-space: normal;
    text-align: right;
    margin-bottom: ${dimensions.unitSpacing}px;

    > button {
      margin-top: ${dimensions.unitSpacing - 5}px;
    }
  }
`;

export {
  ActionBarButtonsWrapper,
  AutomationFormContainer,
  BackButton,
  Title,
  RightActions,
  Dashboards,
  Create,
  Header,
  SelectMemberStyled,
  SidebarListItem,
  EmptyContent
};
