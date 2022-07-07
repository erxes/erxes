import * as React from "react";
import Category from "../components/Category";
import { IKbCategory } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  category: IKbCategory;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ goToCategory }) => <Category {...props} onClick={goToCategory} />}
    </AppConsumer>
  );
};

export default container;
