import * as React from "react";
import Article from "../components/Article";
import { IKbArticle } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  article: IKbArticle;
};

const container = (props: Props) => (
  <AppConsumer>
    {({ goToArticle }) => <Article {...props} onClick={goToArticle} />}
  </AppConsumer>
);

export default container;
