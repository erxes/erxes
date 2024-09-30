import DateFilters from "@erxes/ui-forms/src/forms/containers/filters/DateFilters";
import React from "react";
import SegmentFilter from "../../containers/filters/SegmentFilter";
import TagFilter from "../../containers/filters/TagFilter";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = { loadingMainQuery: boolean };

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
    const { loadingMainQuery } = this.props;

    return (
      <Wrapper.Sidebar hasBorder>
        <SegmentFilter
          loadingMainQuery={loadingMainQuery}
          abortController={this.abortController}
        />

        <TagFilter
          loadingMainQuery={loadingMainQuery}
          abortController={this.abortController}
        />

        <DateFilters type="core:company" loadingMainQuery={loadingMainQuery} />
      </Wrapper.Sidebar>
    );

    return null;
  }
}

export default Sidebar;
