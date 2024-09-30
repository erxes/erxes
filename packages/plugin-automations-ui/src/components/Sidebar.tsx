import { AutomationsCount } from "../types";
import React from "react";
import StatusFilter from "../containers/filters/StatusFilter";
import { TagsSection } from "@erxes/ui-tags/src/components/TagsSection";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  counts: AutomationsCount;
  location: any;
  navigate: any;
  queryParams: any;
};

function Sidebar({ counts, location, navigate, queryParams }: Props) {
  return (
    <Wrapper.Sidebar hasBorder>
      <StatusFilter counts={counts.byStatus} />
      <TagsSection
        queryParams={queryParams}
        location={location}
        navigate={navigate}
        type="automations:automations"
      />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
