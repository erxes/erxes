import React from "react";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";

function Sidebar({
  loadingMainQuery,
  type
}: {
  loadingMainQuery?: boolean;
  type?: string;
}) {
  return (
    <Wrapper.Sidebar hasBorder>
      {isEnabled("tags") && <div>lalla</div>}
    </Wrapper.Sidebar>
  );
}


export default Sidebar;