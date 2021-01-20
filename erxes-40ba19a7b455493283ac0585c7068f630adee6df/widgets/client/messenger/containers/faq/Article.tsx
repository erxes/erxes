import * as React from "react";
import { Article } from "../../components/faq";
import { IFaqArticle } from "../../types";
import { AppConsumer } from "../AppContext";

type Props = {
  article: IFaqArticle;
};

const container = (props: Props) => (
  <AppConsumer>
    {({ goToFaqArticle }) => <Article {...props} onClick={goToFaqArticle} />}
  </AppConsumer>
);

export default container;
