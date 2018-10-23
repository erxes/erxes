import * as React from "react";
import { Article } from "../../components/faq";
import { IFaqArticle } from "../../types";
import { FaqConsumer } from "./FaqContext";

type Props = {
  article: IFaqArticle;
};

const container = (props: Props) => (
  <FaqConsumer>
    {({ goToArticle }) => <Article {...props} onClick={goToArticle} />}
  </FaqConsumer>
);

export default container;
