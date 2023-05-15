import "reactjs-popup/dist/index.css";

import {
  AuthContainer,
  Badge,
  Container,
  Header as Head,
  HeaderLeft,
  HeaderLinks,
  HeaderLogo,
  HeaderRight,
  HeaderTitle,
  HeaderTop,
  LinkItem,
  SupportMenus,
} from "../../styles/main";
import { Config, INotification, IUser } from "../../types";
import React, { useState } from "react";
import { getConfigColor, readFile } from "../../common/utils";

import { Alert } from "../../utils";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import Link from "next/link";
import LoginContainer from "../../user/containers/Login";
import Modal from "../../common/Modal";
import Notifications from "../components/notifications/Notifications";
import Popup from "reactjs-popup";
import RegisterContainer from "../../user/containers/Register";
import ResetPasswordContainer from "../../user/containers/ResetPassword";
import SettingsContainer from "../containers/notifications/Settings";
import { withRouter } from "next/router";

type Props = {
  config: Config;
  currentUser: IUser;
  logout: () => void;
  router: any;
  headerHtml?: string;
  headingSpacing?: boolean;
  headerBottomComponent?: React.ReactNode;
  notificationsCount: number;
};

function Header({
  config,
  currentUser,
  logout,
  router,
  headerHtml,
  headingSpacing,
  headerBottomComponent,
  notificationsCount,
}: Props) {
  const [showlogin, setLogin] = useState(false);
  const [showregister, setRegister] = useState(false);
  const [showResetPassword, setResetPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const onClick = (url) => {
    if (!currentUser && url.includes("tickets")) {
      Alert.error("Log in first to create or manage ticket cards");

      return setLogin(true);
    }
  };

  const renderMenu = (url: string, label: string) => {
    return (
      <LinkItem
        active={router && router.pathname === url}
        onClick={() => onClick(url)}
        color={getConfigColor(config, "headingColor")}
      >
        <Link href={!currentUser && url.includes("tickets") ? "" : url}>
          {label}
        </Link>
      </LinkItem>
    );
  };

  const renderAuth = () => {
    if (!config.ticketToggle) {
      return null;
    }

    return (
      <>
        <Button
          className="border"
          btnStyle="link"
          uppercase={false}
          onClick={() => setRegister(true)}
        >
          Sign up
        </Button>
        <Button
          btnStyle="ghost"
          className="ghost"
          uppercase={false}
          onClick={() => setLogin(true)}
        >
          Sign in
        </Button>
      </>
    );
  };

  const renderTopHeader = () => {
    if (headerHtml)
      return <div dangerouslySetInnerHTML={{ __html: headerHtml }} />;

    return (
      <Container>
        <HeaderTop>
          <HeaderLogo>
            <Link href="/">
              <img src={readFile(config.logo)} />
            </Link>
            <HeaderTitle color={getConfigColor(config, "headingColor")}>
              {config.name}
            </HeaderTitle>
          </HeaderLogo>
          <HeaderLinks>
            {config.publicTaskToggle
              ? renderMenu("/tasks", config.taskLabel || "Task")
              : null}
            {config.ticketToggle
              ? renderMenu("/tickets", config.ticketLabel || "Ticket")
              : null}
          </HeaderLinks>
          <HeaderRight>
            <SupportMenus color={getConfigColor(config, "headingColor")}>
              {currentUser ? (
                <>
                  <>
                    <Icon icon="user" /> &nbsp;
                    {currentUser.type === "company"
                      ? currentUser.companyName
                      : currentUser.firstName}
                  </>

                  <Popup
                    trigger={
                      <span title="Notifications" className="notifications">
                        {notificationsCount > 0 && (
                          <Badge color={"red"}>{notificationsCount}</Badge>
                        )}
                        <Icon icon="bell" />
                      </span>
                    }
                    position="bottom center"
                    contentStyle={{ width: "350px" }}
                  >
                    <Notifications
                      count={notificationsCount}
                      currentUser={currentUser}
                      config={config}
                    />
                  </Popup>

                  <span title="Settings" onClick={() => setShowSettings(true)}>
                    <Icon icon="settings" />
                  </span>

                  <span title="Log out" onClick={() => logout()}>
                    <Icon icon="logout" />
                  </span>
                </>
              ) : (
                renderAuth()
              )}
            </SupportMenus>
          </HeaderRight>
        </HeaderTop>
      </Container>
    );
  };

  return (
    <Head
      background={getConfigColor(config, "headerColor")}
      color={getConfigColor(config, "headingColor")}
      headingSpacing={headingSpacing}
    >
      {renderTopHeader()}
      <Container transparent={true}>
        <h3>{config.description}</h3>
        {headerBottomComponent && headerBottomComponent}
      </Container>
      <Modal
        content={() => (
          <LoginContainer
            setLogin={setLogin}
            setRegister={setRegister}
            setResetPassword={setResetPassword}
          />
        )}
        onClose={() => setLogin(false)}
        isOpen={showlogin}
      />
      <Modal
        content={() => (
          <RegisterContainer setLogin={setLogin} setRegister={setRegister} />
        )}
        onClose={() => setRegister(false)}
        isOpen={showregister}
      />
      <Modal
        content={() => (
          <ResetPasswordContainer
            setLogin={setLogin}
            setResetPassword={setResetPassword}
          />
        )}
        onClose={() => setResetPassword(false)}
        isOpen={showResetPassword}
      />

      <Modal
        content={() => (
          <SettingsContainer
            currentUser={currentUser}
            saveCallback={() => setShowSettings(false)}
          />
        )}
        onClose={() => setShowSettings(false)}
        isOpen={showSettings}
      />
    </Head>
  );
}

export default withRouter(Header);
