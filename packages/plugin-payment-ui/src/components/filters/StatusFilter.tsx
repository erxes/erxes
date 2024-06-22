import { Counts } from "@erxes/ui/src/types";
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Box from "@erxes/ui/src/components/Box";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { PAYMENT_STATUS } from "../../components/constants";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  counts: Counts;
  emptyText?: string;
}

function StatusFilter({ counts, emptyText }: IProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (
    <SidebarList>
      {PAYMENT_STATUS.ALL.map((status, index) => {
        const onClick = () => {
          router.setParams(navigate, location, { status });
          router.removeParams(navigate, location, "page");
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(location, "status") === status ? "active" : ""
              }
              onClick={onClick}
            >
              <FieldStyle>{__(status)}</FieldStyle>
              <SidebarCounter>{counts[status]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by status")}
      collapsible={PAYMENT_STATUS.ALL.length > 5}
      name="showFilterByStatus"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={PAYMENT_STATUS.ALL.length}
        emptyText={emptyText ? emptyText : "Loading"}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default StatusFilter;
