import { IUser } from "modules/auth/types";
import asyncComponent from "modules/common/components/AsyncComponent";
import { IRouterProps } from "@erxes/ui/src/types";
import { bustIframe } from "modules/common/utils";

import React from "react";
import { withRouter } from "react-router-dom";
import Navigation from "../containers/Navigation";
import { Layout, MainWrapper } from "../styles";
import DetectBrowser from "./DetectBrowser";

const MainBar = asyncComponent(() =>
  import(/* webpackChunkName: "MainBar" */ "modules/layout/components/MainBar")
);

interface IProps extends IRouterProps {
  currentUser?: IUser;
  children: React.ReactNode;
  isShownIndicator: boolean;
  enabledServices: any;
  closeLoadingBar: () => void;
}

class MainLayout extends React.Component<IProps> {
  componentDidMount() {
    const { history, currentUser, enabledServices } = this.props;

    if (history.location.pathname !== "/reset-password" && !currentUser) {
      history.push("/sign-in");
    }

    // if (currentUser && process.env.NODE_ENV === 'production') {
    if (currentUser) {
      // Wootric code
      (window as any).wootricSettings = {
        email: currentUser.email, // Required to uniquely identify a user. Email is recommended but this can be any unique identifier.
        created_at: Math.floor(
          (currentUser.createdAt
            ? new Date(currentUser.createdAt)
            : new Date()
          ).getTime() / 1000
        ),
        account_token: "NPS-477ee032", // This is your unique account token.
      };

      const wootricScript = document.createElement("script");
      wootricScript.src = "https://cdn.wootric.com/wootric-sdk.js";

      document.head.appendChild(wootricScript);

      wootricScript.onload = () => {
        (window as any).wootric("run");
      };
    } // end currentUser checking

    if (enabledServices && Object.keys(enabledServices).length !== 0) {
      localStorage.setItem("enabledServices", JSON.stringify(enabledServices));
    }

    // click-jack attack defense
    bustIframe();
  }

  getLastImport = () => {
    return localStorage.getItem("erxes_import_data") || "";
  };

  render() {
    const { currentUser, children, isShownIndicator, history } = this.props;

    if (history.location.pathname.startsWith("/videoCall")) {
      return children;
    }

    return (
      <>
        <div id="anti-clickjack" style={{ display: "none" }} />

        <Layout isSqueezed={isShownIndicator}>
          {currentUser && <Navigation currentUser={currentUser} />}

          <MainWrapper>
            <MainBar />

            {children}
          </MainWrapper>
          <DetectBrowser />
        </Layout>
      </>
    );
  }
}

export default withRouter<IProps>(MainLayout);
