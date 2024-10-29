import { Counts } from "@erxes/ui/src/types";
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Box from "@erxes/ui/src/components/Box";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { PAYMENT_KINDS } from "../../components/constants";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  counts: Counts;
  emptyText?: string;
}

function KindFilter({ counts, emptyText }: IProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const data = (
    <SidebarList>
      {PAYMENT_KINDS.ALL.map((kind, index) => {
        const onClick = () => {
          router.setParams(navigate, location, { kind });
          router.removeParams(navigate, location, "page");
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(location, "kind") === kind ? "active" : ""
              }
              onClick={onClick}
            >
              <FieldStyle>{__(kind)}</FieldStyle>
              <SidebarCounter>{counts[kind]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by kind")}
      collapsible={PAYMENT_KINDS.ALL.length > 5}
      name="showFilterByKind"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={PAYMENT_KINDS.ALL.length}
        emptyText={emptyText ? emptyText : __("Loading")}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default KindFilter;
