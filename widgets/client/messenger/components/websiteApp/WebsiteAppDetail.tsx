import * as React from "react";

import Container from "../common/Container";
import { IWebsiteApp } from "../../types";
import { __ } from "../../../utils";

type Props = {
  websiteApp: IWebsiteApp;
  changeRoute: (route: string) => void;
  loading: boolean;
};

export default class WebsiteAppDetail extends React.PureComponent<Props> {
  render() {
    const { websiteApp, loading } = this.props;

    return (
      <Container
        title={websiteApp.credentials.description}
        withBottomNavBar={false}
      >
        <div className="erxes-content">
          {loading ? (
            <div className="loader" />
          ) : (
            <iframe
              title="erxes-messenger"
              src={websiteApp.credentials.url}
              className="websiteApp"
            />
          )}
        </div>
      </Container>
    );
  }
}
