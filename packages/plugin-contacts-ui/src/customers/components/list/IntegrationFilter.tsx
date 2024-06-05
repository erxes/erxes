import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import React, { useEffect } from "react";
import { __, router } from "coreui/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { INTEGRATION_KINDS } from "@erxes/ui/src/constants/integrations";

interface IProps {
  counts: { [key: string]: number };
  integrationsGetUsedTypes: Array<{ _id: string; name: string }>;
}

function IntegrationFilter({ counts, integrationsGetUsedTypes }: IProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   router.removeParams(navigate, location, "page");
  // }, [location.search]);

  const onClick = (kind) => {
    router.setParams(navigate, location, { integrationType: kind });
  };

  const data = (
    <SidebarList capitalize={true}>
      {integrationsGetUsedTypes.map((kind) => (
        <li key={Math.random()}>
          <a
            href="#filter"
            tabIndex={0}
            className={
              router.getParam(location, "integrationType") === kind._id
                ? "active"
                : ""
            }
            onClick={() => onClick(kind._id)}
          >
            <FieldStyle>{kind.name}</FieldStyle>
            <SidebarCounter>{counts[kind._id] || 0}</SidebarCounter>
          </a>
        </li>
      ))}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by integrations")}
      name="showFilterByIntegrations"
      collapsible={true}
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={INTEGRATION_KINDS.ALL.length}
        emptyText="No integrations"
        emptyIcon="puzzle-piece"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default IntegrationFilter;
