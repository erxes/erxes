import DateFilters from "@erxes/ui-forms/src/forms/containers/filters/DateFilters";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { Counts } from "@erxes/ui/src/types";

import React from "react";
import ClientPortalIdFilter from "../../containers/ClientPortalIdFilter";

type Props = {
  loadingMainQuery: boolean;
  kind?: "client" | "vendor";
  counts: {
    byCP: Counts;
    byType: Counts;
  };
};

function Sidebar({ counts, loadingMainQuery, kind }: Props) {
  return (
    <Wrapper.Sidebar hasBorder={true}>
      <ClientPortalIdFilter counts={counts.byCP} kind={kind} />

      <DateFilters
        type="clientportal:user"
        loadingMainQuery={loadingMainQuery}
      />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
