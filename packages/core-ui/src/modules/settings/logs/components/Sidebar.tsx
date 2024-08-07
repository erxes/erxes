import React from "react";
import { __ } from "@erxes/ui/src/utils";

import { Wrapper } from "@erxes/ui/src/layout";

import UserFilter from "../containers/filters/UserFilter";
import ActionFilter from "./filters/ActionFilter";
import ModuleFilter from "./filters/ModuleFilter";
import DateFilter from "./filters/DateFilter";

type Props = {
  queryParams: Record<string, string>;
};

class Sidebar extends React.Component<Props> {
  private abortController;
  constructor(props) {
    super(props);
    this.abortController = new AbortController();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  render() {
    const { queryParams } = this.props;

    return (
      <Wrapper.Sidebar hasBorder={true}>
        <ModuleFilter queryParams={queryParams} />
        <ActionFilter queryParams={queryParams} />
        <UserFilter
          queryParams={queryParams}
          abortController={this.abortController}
        />
        <DateFilter queryParams={queryParams} />
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
