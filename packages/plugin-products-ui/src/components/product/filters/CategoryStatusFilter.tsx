import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Box from "@erxes/ui/src/components/Box";
import React from "react";
import { categoryStatusChoises } from "../../../utils";
// import { withRouter } from 'react-router-dom';
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  searchable?: boolean;
};

const CategoryStatusFilter: React.FC<Props> = (props) => {
  const productParam = "state";
  const categoryParam = "status";

  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (key, value) => {
    router.setParams(navigate, location, { [key]: value });
    router.setParams(navigate, location, { categoryId: null });
  };

  return (
    <>
      <Box
        title={__("FILTER CATEGORY BY STATUS")}
        name="showFilterByType"
        isOpen={router.getParam(location, [categoryParam])}
      >
        <SidebarList>
          {categoryStatusChoises(__).map(
            ({ value, label }: { value: string; label: string }) =>
              (value === "disabled" || value === "archived") && (
                <li key={Math.random()}>
                  <a
                    href="#filter"
                    tabIndex={0}
                    className={
                      router.getParam(location, [categoryParam]) === value
                        ? "active"
                        : ""
                    }
                    onClick={onClick.bind(this, categoryParam, value)}
                  >
                    <FieldStyle>{label}</FieldStyle>
                  </a>
                </li>
              )
          )}
        </SidebarList>
      </Box>
      <Box
        title={__("FILTER PRODUCT BY STATUS")}
        name="showFilterByType"
        isOpen={router.getParam(location, [productParam])}
      >
        <SidebarList>
          {categoryStatusChoises(__).map(
            (
              { value, label }: { value: string; label: string },
              index: number
            ) =>
              value === "deleted" && (
                <li key={index}>
                  <a
                    href="#filter"
                    tabIndex={0}
                    className={
                      router.getParam(location, [productParam]) === value
                        ? "active"
                        : ""
                    }
                    onClick={onClick.bind(this, productParam, value)}
                  >
                    <FieldStyle>{label}</FieldStyle>
                  </a>
                </li>
              )
          )}
        </SidebarList>
      </Box>
    </>
  );
};

export default CategoryStatusFilter;
// export default withRouter<IRouterProps>(CategoryStatusFilter);
