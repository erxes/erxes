import { __, router } from "@erxes/ui/src/utils";
import { FieldStyle, SidebarList, Box, DataWithLoader } from "@erxes/ui/src";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: Record<string, string>;
};

const actionOptions = [
  { value: "create", label: __("Create") },
  { value: "update", label: __("Update") },
  { value: "delete", label: __("Delete") },
];

function ActionFilter({ queryParams }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const onClick = (action) => {
    router.setParams(navigate, location, { action: action.value });
  };

  const content = (
    <SidebarList>
      {actionOptions.map((action) => {
        return (
          <li key={action.value}>
            <a
              href="#filter"
              tabIndex={0}
              className={queryParams.action === action.value ? "active" : ""}
              onClick={() => onClick(action)}
            >
              <FieldStyle>{action.label}</FieldStyle>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by Action")}
      name="showFilterByAction"
      isOpen={queryParams.action ? true : false}
    >
      <DataWithLoader
        data={content}
        loading={false}
        count={actionOptions.length}
        emptyText={"There is no Action"}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default ActionFilter;
