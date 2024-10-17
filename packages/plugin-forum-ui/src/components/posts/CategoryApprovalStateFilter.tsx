import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Box from "@erxes/ui/src/components/Box";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import React from "react";
import { categoryApprovalStates } from "../../constants";
import { useNavigate, useLocation } from "react-router-dom";

interface IProps {
  emptyText?: string;
}

function CategoryApprovalStateFilter({ emptyText }: IProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const data = (
    <SidebarList>
      {categoryApprovalStates.map((categoryApprovalState, index) => {
        const onClick = () => {
          router.setParams(navigate, location, {
            categoryApprovalState: categoryApprovalState.key,
          });
          router.removeParams(navigate, location, "page");
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(location, "categoryApprovalState") ===
                categoryApprovalState.key
                  ? "active"
                  : ""
              }
              onClick={onClick}
            >
              <FieldStyle>{__(categoryApprovalState.value)}</FieldStyle>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by Approval State")}
      collapsible={categoryApprovalStates.length > 5}
      name="showFilterBycategoryApprovalState"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={categoryApprovalStates.length}
        emptyText={emptyText ? emptyText : __("Loading")}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default CategoryApprovalStateFilter;
