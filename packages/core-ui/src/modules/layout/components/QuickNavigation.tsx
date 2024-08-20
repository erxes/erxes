import { DropNav, Setup, UserHelper } from "../styles";
import {
  FrontlineTasks,
  GeneralTasks,
  MarketingTasks,
  OperationTasks,
  SalesTasks,
} from "modules/welcome/constants";
import { colors, dimensions } from "modules/common/styles";

import BrandChooser from "./BrandChooser";
import Button from "@erxes/ui/src/components/Button";
import { IOrganization } from "@erxes/ui/src/auth/types";
import { IUser } from "modules/auth/types";
import Icon from "modules/common/components/Icon";
import { Link } from "react-router-dom";
import { Menu } from "@headlessui/react";
import { MenuDivider } from "@erxes/ui/src/styles/main";
import ModalTrigger from "modules/common/components/ModalTrigger";
import NameCard from "modules/common/components/nameCard/NameCard";
import Organizations from "modules/saas/navigation/Organizations";
import ProgressBar from "@erxes/ui/src/components/ProgressBar";
import React from "react";
import Search from "../containers/Search";
import { SubMenu } from "modules/saas/navigation/styles";
import Tip from "modules/common/components/Tip";
import Usage from "modules/saas/settings/plans/components/Usage";
import { __ } from "modules/common/utils";
import asyncComponent from "modules/common/components/AsyncComponent";
import { getVersion } from "@erxes/ui/src/utils/core";
import { pluginsOfTopNavigations } from "pluginUtils";
import styled from "styled-components";
import styledTS from "styled-components-ts";

const Signature = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Signature" */ "@erxes/ui-settings/src/email/containers/Signature"
    )
);

const ChangePassword = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"ChangePassword" */ "modules/settings/profile/containers/ChangePassword"
    )
);

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

const NameCardWrapper = styled.div`
  padding: 10px 20px 0;
`;

export const NavItem = styledTS<{ center?: boolean }>(styled.div)`
  padding-left: 18px;
  display: table-cell;
  vertical-align: middle;

  > a {
    color: ${colors.textSecondary};
    display: ${(props) => (props.center ? "inline-block" : "flex")};
    align-items: center;

    &.setup {
      padding: 2px 15px;
    }

    &:hover {
      color: ${colors.colorSecondary};
    }
  }

  [id^="headlessui-menu-items-"] {
    min-width: 220px;
  }

  [id^="headlessui-menu-items-"] button {
    border: none;
    background: none;
    text-align: left;

    &:hover {
      background: ${colors.bgActive};
      cursor: pointer;
    }
  }
`;

const Version = styled.div`
  padding: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px;
  float: right;

  span {
    background: #f2f2f2;
    padding: 3px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    font-size: 9px;
    color: ${colors.colorCoreGray};
    border: 1px solid ${colors.borderPrimary};
  }
`;

const QuickNavigation = ({
  logout,
  currentUser,
  showBrands,
  selectedBrands,
  onChangeBrands,
  release,
}: {
  logout: () => void;
  currentUser: IUser;
  showBrands: boolean;
  selectedBrands: string[];
  onChangeBrands: (value: string) => void;
  release: string;
}) => {
  const onFeedbackClick = () => {
    (window as any).Userback.open();
  };

  const passContent = (props) => <ChangePassword {...props} />;
  const signatureContent = (props) => <Signature {...props} />;
  const completedSteps = currentUser.onboardingHistory
    ? currentUser.onboardingHistory.completedSteps || []
    : [];
  const brands = currentUser.brands || [];

  const brandOptions = brands.map((brand) => ({
    value: brand._id,
    label: brand.name || "",
  }));

  let brandsCombo;

  if (showBrands && brands.length > 1) {
    brandsCombo = (
      <NavItem>
        <BrandChooser
          selectedItems={selectedBrands}
          items={brandOptions}
          onChange={onChangeBrands}
        />
      </NavItem>
    );
  }

  const { VERSION } = getVersion();

  const compareStepsWithActions = (completedSteps, tasks) => {
    return tasks.map((task) => ({
      ...task,
      isCompleted: completedSteps.includes(task.action),
    }));
  };

  const calculateCompletionPercentage = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.isCompleted).length;

    return (completedTasks / totalTasks) * 100;
  };

  const renderProcess = () => {
    const { experience } =
      currentUser?.currentOrganization || ({} as IOrganization);
    const eCode = experience?.customCode || "marketing";

    const operationTasks =
      eCode === "marketing"
        ? MarketingTasks
        : eCode === "sales"
          ? SalesTasks
          : eCode === "frontline"
            ? FrontlineTasks
            : eCode === "operation"
              ? OperationTasks
              : [];

    const allTasks = [...GeneralTasks, ...operationTasks];

    const tasksWithCompletionStatus = compareStepsWithActions(
      completedSteps,
      allTasks
    );
    const completionPercentage = calculateCompletionPercentage(
      tasksWithCompletionStatus
    );

    // const steps = completedSteps.includes('');
    const percentage = Number(completionPercentage.toFixed(1)) || 0;

    return (
      <ProgressBar
        percentage={percentage}
        type="circle"
        height="28"
        color="#32D583"
        strokeWidthNumber={5}
      >
        <span>{percentage}%</span>
      </ProgressBar>
    );
  };

  return (
    <nav id={"SettingsNav"}>
      {brandsCombo}

      {VERSION && VERSION === "saas" && (
        <NavItem center={true}>
          <Button size="small" href="https://erxes.io/add-ons">
            <Icon icon="star" />
            <span>{__(`Upgrade your plan`)}</span>
          </Button>

          <Button
            className="setup"
            size="small"
            btnStyle="simple"
            href="/welcome"
          >
            <Setup>
              <Icon icon="settings" />
              <span>{__(`Continue Setup`)}</span>
              {renderProcess()}
              <Icon icon="angle-right-b" />
            </Setup>
          </Button>
        </NavItem>
      )}

      <NavItem>
        <Search />
      </NavItem>

      <NavItem>
        <Tip text={__("Userback feedback widget")} placement="bottom">
          <a href="#feedback" onClick={onFeedbackClick}>
            <Icon icon="feedback" size={20} />
          </a>
        </Tip>
      </NavItem>

      {pluginsOfTopNavigations()}
      <NavItem>
        <Menu as="div" className="relative">
          <Menu.Button>
            <UserHelper>
              <UserInfo>
                <NameCard.Avatar user={currentUser} size={30} />
                <Icon icon="angle-down" size={14} />
              </UserInfo>
            </UserHelper>
          </Menu.Button>
          <Menu.Items className="absolute" unmount={false}>
            <NameCardWrapper>
              <NameCard user={currentUser} />
            </NameCardWrapper>
            <MenuDivider />
            <Menu.Item>
              <Link to="/profile">{__("My Profile")}</Link>
            </Menu.Item>
            <Menu.Item>
              <DropNav>
                {__("Account Settings")}
                <Icon icon="angle-right" />
                <ul>
                  <ModalTrigger
                    title="Change Password"
                    trigger={
                      <li>
                        <a href="#change-password">{__("Change password")}</a>
                      </li>
                    }
                    content={passContent}
                  />

                  <ModalTrigger
                    title="Email signatures"
                    enforceFocus={false}
                    trigger={
                      <li>
                        <a href="#email">{__("Email signatures")}</a>
                      </li>
                    }
                    content={signatureContent}
                  />
                </ul>
              </DropNav>
            </Menu.Item>
            <MenuDivider />
            {VERSION &&
            VERSION === "saas" &&
            currentUser.currentOrganization ? (
              <>
                <Menu.Item>
                  <Link to="https://erxes.io/organizations">
                    {__("Go to Global Profile")}
                  </Link>
                </Menu.Item>

                <MenuDivider />
                <Menu.Item>
                  <SubMenu>
                    <Organizations
                      organizations={currentUser.organizations || []}
                    />
                  </SubMenu>
                </Menu.Item>
                <Usage />
              </>
            ) : null}
            <Menu.Item>
              <button onClick={logout}>{__("Sign out")}</button>
            </Menu.Item>
            {release ? (
              <Version>
                <span>
                  version <b>{release}</b>
                </span>
              </Version>
            ) : null}
          </Menu.Items>
        </Menu>
      </NavItem>
    </nav>
  );
};

export default QuickNavigation;
