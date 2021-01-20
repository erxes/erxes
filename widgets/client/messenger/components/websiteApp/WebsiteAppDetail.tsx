import * as React from "react";
import { iconLeft } from "../../../icons/Icons";
import { __ } from "../../../utils";
import { TopBar } from "../../containers";
import { IWebsiteApp } from "../../types";

type Props = {
  websiteApp: IWebsiteApp;
  changeRoute: (route: string) => void;
};

export default class WebsiteAppDetail extends React.PureComponent<Props> {
  render() {
    const { changeRoute, websiteApp } = this.props;

    const onClick = () => changeRoute("home");

    return (
      <>
        <TopBar
          middle={websiteApp.credentials.description}
          buttonIcon={iconLeft()}
          onLeftButtonClick={onClick}
        />
        <div className="erxes-content">
          <iframe src={websiteApp.credentials.url} className="websiteApp" />
        </div>
      </>
    );
  }
}
