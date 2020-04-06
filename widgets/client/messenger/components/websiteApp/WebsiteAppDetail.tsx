import * as React from "react";
import { iconLeft } from "../../../icons/Icons";
import { __ } from "../../../utils";
import { TopBar } from "../../containers";

type Props = {
  config: { [key: string]: string };
  changeRoute: (route: string) => void;
};

export default class WebsiteAppDetail extends React.PureComponent<Props> {
  render() {
    const { changeRoute, config } = this.props;

    const onClick = () => changeRoute("home");

    return (
      <>
        <TopBar
          middle={config.description}
          buttonIcon={iconLeft}
          onLeftButtonClick={onClick}
        />
        <div className="erxes-content">
          <iframe src={config.url} className="websiteApp" />
        </div>
      </>
    );
  }
}
