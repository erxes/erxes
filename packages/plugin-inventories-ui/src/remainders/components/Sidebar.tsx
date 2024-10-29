import { __, router } from "@erxes/ui/src/utils/core";
import { useLocation, useNavigate } from "react-router-dom";

import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import { SidebarList as List } from "@erxes/ui/src/layout";
import React from "react";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import { SidebarFilters } from "../../styles";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

const { Section } = Wrapper.Sidebar;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const categoryId = router.getParam(location, "categoryId");
  const branchId = router.getParam(location, "branchId");
  const departmentId = router.getParam(location, "departmentId");

  const clearFilter = () => {
    router.setParams(navigate, location, {
      categoryId: null,
      branchId: null,
      departmentId: null,
      beginDate: null,
      endDate: null,
      productIds: null,
    });
  };

  const setFilter = (key, value) => {
    router.setParams(navigate, location, { [key]: value, page: 1 });
  };

  return (
    <Wrapper.Sidebar>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {(branchId || departmentId || categoryId) && (
            <a href="#cancel" tabIndex={0} onClick={clearFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <SidebarFilters>
        <List id="SettingsSidebar">
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label={__("Choose branch")}
              name="branchId"
              initialValue={branchId || ""}
              customOption={{
                value: "",
                label: __("...Clear branch filter"),
              }}
              onSelect={(branchId) => setFilter("branchId", branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label={__("Choose department")}
              name="departmentId"
              initialValue={departmentId || ""}
              customOption={{
                value: "",
                label: "...Clear department filter",
              }}
              onSelect={(departmentId) =>
                setFilter("departmentId", departmentId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Product Category</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="categoryId"
              initialValue={categoryId || ""}
              customOption={{
                value: "",
                label: "...Clear product category filter",
              }}
              onSelect={(categoryId) => setFilter("categoryId", categoryId)}
              multi={false}
            />
          </FormGroup>
        </List>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
}
