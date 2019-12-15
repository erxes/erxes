import * as React from "react";
import { __ } from "../../../utils";

type Props = {
  config: { [key: string]: string };
  changeRoute: (route: string) => void;
  color: string;
};

function WebsiteApp(props: Props) {
  const { config, changeRoute, color } = props;

  const onClick = () => changeRoute("websiteApp");

  return (
    <div className="websiteApp-home">
      <p>{config.description}</p>
      <button onClick={onClick} style={{ backgroundColor: color }}>
        {config.buttonText}
      </button>
    </div>
  );
}

export default WebsiteApp;
