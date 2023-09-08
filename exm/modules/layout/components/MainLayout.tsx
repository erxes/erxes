import { Layout, MainWrapper } from "../styles";

import DetectBrowser from "./DetectBrowser";
import { IUser } from "../../auth/types";
import MainBar from "./MainBar";
import Navigation from "./Navigation";
import React from "react";

interface IProps {
  currentUser?: IUser;
  children: React.ReactNode;
}

class MainLayout extends React.Component<IProps> {
  render() {
    const { children } = this.props;

    return (
      <>
        <div id="anti-clickjack" style={{ display: "none" }} />

        <Layout>
          <Navigation />

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

export default MainLayout;
