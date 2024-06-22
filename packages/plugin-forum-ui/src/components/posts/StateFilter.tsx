import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Box from "@erxes/ui/src/components/Box";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import React from "react";
import { stateFilters } from "../../constants";
import { useNavigate, useLocation } from "react-router-dom";

interface IProps {
  emptyText?: string;
}

function StateFilter({ emptyText }: IProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const data = (
    <SidebarList>
      {stateFilters.map((state, index) => {
        const onClick = () => {
          router.setParams(navigate, location, { state: state.key });
          router.removeParams(navigate, location, "page");
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(location, "state") === state.key ? "active" : ""
              }
              onClick={onClick}
            >
              <FieldStyle>{__(state.value)}</FieldStyle>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by state")}
      collapsible={stateFilters.length > 5}
      name="showFilterByState"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={stateFilters.length}
        emptyText={emptyText ? emptyText : "Loading"}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default StateFilter;
