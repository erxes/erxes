import React from "react";
import { Container, MainContent } from "../../styles/main";
import Header from "../containers/Header";
import { Config, IUser } from "../../types";
import { getConfigColor } from "../../common/utils";
import { getEnv } from "../../../utils/configs";

type Props = {
  topic: any;
  config: Config;
  children: any;
  currentUser: IUser;
  headerBottomComponent?: React.ReactNode;
  headingSpacing?: boolean;
};

const { REACT_APP_DOMAIN } = getEnv();

class Script extends React.Component<{ brandCode: string }> {
  componentDidMount() {
    (window as any).erxesSettings = {
      messenger: {
        brand_id: this.props.brandCode,
      },
    };

    (() => {
      const script = document.createElement("script");
      script.src = `${
        REACT_APP_DOMAIN.includes("https")
          ? `${REACT_APP_DOMAIN}/widgets`
          : "http://localhost:3200"
      }/build/messengerWidget.bundle.js`;
      script.async = true;

      const entry = document.getElementsByTagName("script")[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  }

  render() {
    return null;
  }
}

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
      <MainContent
        baseColor={getConfigColor(config, "baseColor")}
        bodyColor={getConfigColor(config, "bodyColor")}
      >
        <Container>{children({ config, topic })}</Container>
      </MainContent>

      {config.messengerBrandCode ? (
        <Script brandCode={config.messengerBrandCode} />
      ) : null}
    </>
  );
}

export default Layout;
