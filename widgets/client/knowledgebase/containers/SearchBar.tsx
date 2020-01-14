import * as React from "react";
import { SearchBar } from "../components";
import { AppConsumer } from "./AppContext";

type Props = {
  color: string;
};

const container = (props: Props) => (
  <AppConsumer>
    {({ search, searchString }) => (
      <SearchBar {...props} searchString={searchString} onSearch={search} />
    )}
  </AppConsumer>
);

export default container;
