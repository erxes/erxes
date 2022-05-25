import React from "react";
import Footer from "./Footer";
import { Container, MainContent } from "../../styles/main";
import Header from "../containers/Header";
import { Config, IUser } from "../../types";
import { getConfigColor } from "../../common/utils";

type Props = {
  topic: any;
  config: Config;
  children: any;
  currentUser: IUser;
  headerBottomComponent?: React.ReactNode;
  headingSpacing?: boolean;
};

function Layout({
  config,
  topic,
  children,
  currentUser,
  headingSpacing,
  headerBottomComponent,
}: Props) {
  return (
    <>
      <Header
        config={config}
        currentUser={currentUser}
        headingSpacing={headingSpacing}
        headerBottomComponent={headerBottomComponent}
      />
      <MainContent baseColor={getConfigColor(config, "baseColor")}>
        <Container>{children({ config, topic })}</Container>
      </MainContent>
      <Footer config={config} />
    </>
  );
}

export default Layout;
