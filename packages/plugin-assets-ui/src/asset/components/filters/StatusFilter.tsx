import React, { useEffect } from "react";
import Box from "@erxes/ui/src/components/Box";
import Icon from "@erxes/ui/src/components/Icon";
import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { router, __ } from "@erxes/ui/src/utils";
import { assetStatusChoises } from "../../../common/utils";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const StatusFilter = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (queryParams.status === undefined || queryParams.status === null) {
      router.removeParams(navigate, location, "assetCategoryId");
    }
  }, [queryParams.status]);

  const onClick = (value) => {
    router.setParams(navigate, location, {
      status: value,
      assetId: undefined,
      assetCategoryId: undefined,
    });
  };

  return (
    <Box
      title={__("Filter category by status")}
      name="showFilterByType"
      isOpen={queryParams.status}
    >
      <SidebarList>
        {assetStatusChoises().map(
          ({ value, label }: { value: string; label: string }) => {
            return (
              <li key={Math.random()}>
                <a
                  href="#filter"
                  tabIndex={0}
                  className={queryParams.status === value ? "active" : ""}
                  onClick={onClick.bind(this, value)}
                >
                  <FieldStyle>{label}</FieldStyle>
                </a>
              </li>
            );
          }
        )}
      </SidebarList>
    </Box>
  );
};

export default StatusFilter;
