import { Config, IUser } from "../../types";
import { LeftContent, LeftSidebar } from "../../styles/profile";

import Dropdown from "react-bootstrap/Dropdown";
import Icon from "../../common/Icon";
import NameCard from "../../common/nameCard/NameCard";
import React from "react";
import { getConfigColor } from "../../common/utils";
import { renderUserFullName } from "../../utils";
import { useRouter } from "next/router";

type Props = {
  config: Config;
  currentUser: IUser;
  children: any;
  logout: () => void;
};

function SettingsLayout({
  currentUser = {} as IUser,
  config,
  children,
  logout,
}: Props) {
  const router = useRouter();

  const renderMenu = (icon: string, url: string, name: string) => {
    return (
      <Dropdown.Item
        href={url}
        className={`d-flex align-items-center flex-fill ${
          router.pathname === url ? "selected" : ""
        }`}
      >
        <Icon icon={icon} size={16} /> &nbsp; {name}
      </Dropdown.Item>
    );
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <LeftSidebar baseColor={getConfigColor(config, "baseColor")}>
          <div className="header-info d-flex flex-column align-items-center text-center ">
            <NameCard user={currentUser} avatarSize={80} hideUserName={true} />
            <h6>{renderUserFullName(currentUser)}</h6>
            {currentUser && currentUser.email && <p>{currentUser.email}</p>}
          </div>
          <Dropdown.Divider />
          <div className="list">
            {renderMenu("dashboard", "/profile", "My profle")}
            {renderMenu("settings", "/settings", "Settings")}
            <Dropdown.Item onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.clear()
                }
              logout()
            }}>
              <Icon icon="sign-out-alt" size={18} /> &nbsp; Logout
            </Dropdown.Item>
          </div>
        </LeftSidebar>
      </div>
      <div className="col-md-8">
        <LeftContent>{children({ config, currentUser })}</LeftContent>
      </div>
    </div>
  );
}

export default SettingsLayout;
