import * as React from "react";
import BrandInfo from "../../components/common/BrandInfo";
import { AppConsumer } from "../AppContext";

const container = () => (
  <AppConsumer>
    {({ getBrand }) => <BrandInfo brand={getBrand()} />}
  </AppConsumer>
);

export default container;
