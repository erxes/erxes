import React from "react";
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
  notificationsCount: number;
};

function Layout({
  config,
  topic,
  children,
  currentUser,
  headingSpacing,
  headerBottomComponent,
  notificationsCount
}: Props) {
  return (
    <>
      <Header
        config={config}
        currentUser={currentUser}
        headingSpacing={headingSpacing}
        headerHtml={config.headerHtml}
        headerBottomComponent={headerBottomComponent}
        notificationsCount={notificationsCount || 0}
      />

      <MainContent
        baseColor={getConfigColor(config, "baseColor")}
        bodyColor={getConfigColor(config, "bodyColor")}
      >
        <Container>{children({ config, topic })}</Container>
      </MainContent>

      <div dangerouslySetInnerHTML={{ __html: config.footerHtml || "" }} />
    </>
  );
}

export default Layout;
