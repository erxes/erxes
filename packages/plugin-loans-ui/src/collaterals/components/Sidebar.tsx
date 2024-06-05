import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import React from "react";

import CollateralTypeList from "../containers/CollateralTypeList";

function Sidebar({
  queryParams,
}: {
  loadingMainQuery: boolean;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar>
      <CollateralTypeList queryParams={queryParams} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
