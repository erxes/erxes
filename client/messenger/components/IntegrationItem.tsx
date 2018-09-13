import * as React from "react";
import { __ } from "../../utils";

type Props = {
  children: React.ReactNode;
  title: string;
};

function IntegrationItem(props: Props) {
  const { children, title } = props;

  return (
    <div className="integration-box appear-slide-in">
      <h4>{__(title)}</h4>
      {children}
    </div>
  );
}

export default IntegrationItem;
