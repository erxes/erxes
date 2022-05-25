import Link from "next/link";
import { withRouter } from "next/router";
import React, { useState } from "react";
import Icon from "../../common/Icon";
import Modal from "../../common/Modal";
import { getConfigColor, readFile } from "../../common/utils";
import {
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
  WebLink,
} from "../../styles/main";
import { Config, IUser } from "../../types";
import Button from "../../common/Button";
import LoginContainer from "../../user/containers/Login";
import RegisterContainer from "../../user/containers/Register";
import ResetPasswordContainer from "../../user/containers/ResetPassword";
import { Alert } from "../../utils";

type Props = {
  config: Config;
  currentUser: IUser;
  logout: () => void;
  router: any;
  headingSpacing?: boolean;
  headerBottomComponent?: React.ReactNode;
};

function Header({
  config,
  currentUser,
  logout,
  router,
  headingSpacing,
  headerBottomComponent,
}: Props) {
  const [showlogin, setLogin] = useState(false);
  const [showregister, setRegister] = useState(false);
  const [showResetPassword, setResetPassword] = useState(false);

  const onClick = (url) => {
    if (!currentUser && url.includes("tickets")) {
      Alert.error("Log in first to create or manage ticket cards");

      return setLogin(true);
    }
  };

  const renderMenu = (url: string, label: string) => {
    return (
      <LinkItem active={router && router.pathname === url} onClick={() => onClick(url)}>
        <Link href={!currentUser && url.includes("tickets") ? "" : url}>
          {label}
        </Link>
      </LinkItem>
    );
  };

  return (
    <Head
      color={getConfigColor(config, "headerColor")}
      headingSpacing={headingSpacing}
    >
      <Container transparent={true}>
        <HeaderTop>
          <HeaderLeft>
            <WebLink
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="external-link-alt" /> {config.name} &nbsp;
            </WebLink>
          </HeaderLeft>
          <HeaderRight>
            <SupportMenus>
              {currentUser ? (
                <span title="Log out" onClick={() => logout()}>
                  <Icon icon="user" /> &nbsp;
                  {currentUser.type === 'company'
                    ? currentUser.companyName
                    : currentUser.firstName}
                </span>
              ) : (
                <>
                  <Button
                    btnStyle="link"
                    uppercase={false}
                    onClick={() => setRegister(true)}
                  >
                    Sign up
                  </Button>
                  {/* <Button
                    btnStyle="primary"
                    uppercase={false}
                    onClick={() => setResetPassword(true)}
                  >
                    Reset password
                  </Button> */}
                  <Button
                    btnStyle="warning"
                    uppercase={false}
                    onClick={() => setLogin(true)}
                  >
                    Login
                  </Button>
                </>
              )}
            </SupportMenus>
          </HeaderRight>
        </HeaderTop>
        <HeaderTop>
          <HeaderLogo>
            <Link href="/">
              <img src={readFile(config.logo)} />
            </Link>
            <HeaderTitle>{config.name}</HeaderTitle>
          </HeaderLogo>
          <HeaderLinks>
            {renderMenu("/", config.knowledgeBaseLabel || "Knowledge Base")}
            {config.publicTaskToggle ? renderMenu("/tasks", config.taskLabel || "Task") : null}
            {config.ticketToggle ? renderMenu("/tickets", config.ticketLabel || "Ticket"): null}
          </HeaderLinks>
        </HeaderTop>
        <h3>{config.description}</h3>
        {headerBottomComponent && headerBottomComponent}
      </Container>
      <Modal
        content={() => <LoginContainer />}
        onClose={() => setLogin(false)}
        isOpen={showlogin}
      />
      <Modal
        content={() => <RegisterContainer />}
        onClose={() => setRegister(false)}
        isOpen={showregister}
      />
      <Modal
        content={() => <ResetPasswordContainer />}
        onClose={() => setResetPassword(false)}
        isOpen={showResetPassword}
      />
    </Head>
  );
}

export default withRouter(Header);
