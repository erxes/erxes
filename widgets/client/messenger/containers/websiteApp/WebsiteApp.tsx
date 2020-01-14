import * as React from "react";
import { WebsiteApp } from "../../components";
import { AppConsumer } from "../AppContext";

type Props = {
  config: { [key: string]: string };
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ changeRoute, getColor }) => {
        return (
          <WebsiteApp {...props} changeRoute={changeRoute} color={getColor()} />
        );
      }}
    </AppConsumer>
  );
};

export default container;
