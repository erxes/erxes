import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import React from "react";
import { productTypeChoises } from "../../../utils";

interface IProps {
  searchable?: boolean;
}

const ProductTypeFilter: React.FC<IProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const paramKey = "type";

  const onClick = (key, value) => {
    router.setParams(navigate, location, { [key]: value });
  };

  return (
    <Box
      title={__("Filter by type")}
      name="showFilterByType"
      isOpen={router.getParam(location, [paramKey])}
    >
      <SidebarList>
        {productTypeChoises(__).map(
          ({ value, label }: { value: string; label: string }) => {
            return (
              <li key={Math.random()}>
                <a
                  href="#filter"
                  tabIndex={0}
                  className={
                    router.getParam(location, [paramKey]) === value
                      ? "active"
                      : ""
                  }
                  onClick={onClick.bind(this, paramKey, value)}
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

export default ProductTypeFilter;
