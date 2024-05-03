import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import React from "react";

import CategoryList from "../containers/CategoryList";

function Sidebar({
  queryParams,
}: {
  loadingMainQuery: boolean;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar>
      <CategoryList queryParams={queryParams} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
