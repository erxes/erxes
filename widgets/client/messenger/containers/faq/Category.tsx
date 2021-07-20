import * as React from "react";
import { Category } from "../../components/faq";
import { IFaqCategory } from "../../types";
import { AppConsumer } from "../AppContext";

type Props = {
  category: IFaqCategory;
  childrens?: IFaqCategory[];
  getCurrentItem?: (currentCategory: IFaqCategory) => void;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ goToFaqCategory }) => (
        <Category {...props} onClick={goToFaqCategory} />
      )}
    </AppConsumer>
  );
};

export default container;
