import { MainContainer, SideContainer } from "../styles";
import { colors, dimensions } from "../../styles";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "../../common/DropdownToggle";
import { IUser } from "../../auth/types";
import Icon from "../../common/Icon";
import Link from "next/link";
import ModalTrigger from "../../common/ModalTrigger";
import NameCard from "../../common/nameCard/NameCard";
import React from "react";
import Search from "../containers/Search";
import { __ } from "../../../utils";
import styled from "styled-components";

const UserHelper = styled.div`
  height: 50px;
  display: flex;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    float: none;
    margin: 0 5px 0 0;
  }

  i {
    width: 10px;
  }
`;

export const NavItem = styled.div`
  > a {
    color: ${colors.textSecondary};
    display: flex;
    align-items: center;

    &:hover {
      color: ${colors.colorSecondary};
    }
  }
`;

export const RightTopbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${dimensions.coreSpacing}px;

  > i {
    background: ${colors.colorWhite};
    box-shadow: 0px 3.5px 5.5px rgba(0, 0, 0, 0.02);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.colorPrimaryDark};
    width: 48px;
    height: 48px;
    cursor: pointer;
    margin-right: ${dimensions.unitSpacing}px;
  }

  .dropdown-menu {
    min-width: 240px;
  }
`;

const QuickNavigation = ({ currentUser }: { currentUser: IUser }) => {
  return (
    <nav id={"SettingsNav"}>
      <MainContainer>
        <NavItem>
          <Search />
        </NavItem>
      </MainContainer>
      <SideContainer>
        <RightTopbar>
          <Icon icon="bell" size={22} />
          <Icon icon="settings" size={18} />
          <Dropdown alignRight={true}>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-user">
              <UserHelper>
                <UserInfo>
                  <NameCard.Avatar user={currentUser} size={45} />
                </UserInfo>
              </UserHelper>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <li>
                <Link href="/profile">{__("My Profile")}</Link>
              </li>

              <Dropdown.Divider />
              <Dropdown.Item>{__("Sign out")}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </RightTopbar>
      </SideContainer>
    </nav>
  );
};

export default QuickNavigation;
