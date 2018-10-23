import * as React from "react";
import { Category } from "../../components/faq";
import { IFaqCategory } from "../../types";
import { AppConsumer } from "../AppContext";

type Props = {
  category: IFaqCategory;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ goToCategory }) => <Category {...props} onClick={goToCategory} />}
    </AppConsumer>
  );
};

export default container;
