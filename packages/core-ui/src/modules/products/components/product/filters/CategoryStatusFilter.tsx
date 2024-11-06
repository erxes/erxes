import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import React from "react";
import { categoryStatusChoises, productsStatusChoises } from "../../../utils";

type Props = {
  searchable?: boolean;
};

const CategoryStatusFilter: React.FC<Props> = (props) => {
  const categoryParam = "status";

  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (key, value) => {
    router.setParams(navigate, location, { [key]: value });
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
            ({ value, label }: { value: string; label: string }) => (
              <li key={Math.random()}>
                <a
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
            ))}
        </SidebarList>
      </Box>
      <Box
        title={__("FILTER PRODUCT BY STATUS")}
        name="showFilterByType"
        isOpen={router.getParam(location, ['state']) || router.getParam(location, ['image'])}
      >
        <SidebarList>
          {productsStatusChoises(__).map(
            (
              { value, label, filter }: { value: string; label: string, filter: string },
              index: number
            ) => (
              <li key={index}>
                <a
                  tabIndex={0}
                  className={
                    router.getParam(location, [filter]) === value
                      ? "active"
                      : ""
                  }
                  onClick={onClick.bind(this, filter, value)}
                >
                  <FieldStyle>{label}</FieldStyle>
                </a>
              </li>
            ))}
        </SidebarList>
      </Box>
    </>
  );
};

export default CategoryStatusFilter;
