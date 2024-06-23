import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Box from "@erxes/ui/src/components/Box";
import { ClientPortalConfig } from "../../types";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  counts: { [key: string]: number };
  loading: boolean;
  emptyText?: string;
  clientPortalGetConfigs: ClientPortalConfig[];
  kind?: string;
}

function ClientPortalUser({
  counts,
  loading,
  emptyText,
  clientPortalGetConfigs,
  kind = "client",
}: IProps) {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (
      clientPortalGetConfigs.length > 0 &&
      !router.getParam(location, "cpId")
    ) {
      router.setParams(navigate, location, {
        cpId: clientPortalGetConfigs[0]._id,
      });
    }
  }, [clientPortalGetConfigs]);

  const onRemove = () => {
    router.removeParams(navigate, location, "cpId");
  };

  const onClickRow = (id) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { cpId: id });
  };

  const extraButtons = (
    <>
      {router.getParam(location, "cpId") && (
        <a href="#" tabIndex={0} onClick={onRemove}>
          <Icon icon="times-circle" />
        </a>
      )}
    </>
  );

  const data = (
    <SidebarList>
      {clientPortalGetConfigs.map((cp) => {
  

        return (
          <li key={cp._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(location, "clientPortalId") === cp._id
                  ? "active"
                  : ""
              }
              onClick={()=> onClickRow(cp._id)}
            >
              <FieldStyle>{cp.name}</FieldStyle>
              <SidebarCounter>{counts[cp._id || ""]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__(`Filter by ${kind} portal`)}
      collapsible={clientPortalGetConfigs.length > 5}
      extraButtons={extraButtons}
      name="showFilterByClientPortalId"
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={clientPortalGetConfigs.length}
        emptyText={emptyText || "Empty"}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default ClientPortalUser;
