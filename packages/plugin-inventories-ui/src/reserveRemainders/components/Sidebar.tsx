import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import Tip from "@erxes/ui/src/components/Tip";
import { __, router } from "@erxes/ui/src/utils";
import { SidebarFilters } from "../../styles";
import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

const Sidebar: React.FC<Props> = (props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const clearFilter = () => {
    router.removeParams(
      navigate,
      location,
      "date",
      "filterStatus",
      "branchId",
      "departmentId",
      "productCategoryId",
      "productId",
      "remainder"
    );
  };

  const setFilter = (name, value) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { [name]: value });
  };

  const onChange = (e) => {
    const value = e.target.value;
    setFilter("remainder", value);
  };

  return (
    <Wrapper.Sidebar hasBorder>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {(router.getParam(location, "branchId") ||
            router.getParam(location, "departmentId") ||
            router.getParam(location, "productCategoryId") ||
            router.getParam(location, "productId") ||
            router.getParam(location, "remainder")) && (
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
              label="Choose branch"
              name="branchId"
              initialValue={queryParams.branchId || ""}
              customOption={{
                value: "",
                label: "...Clear branch filter",
              }}
              onSelect={(branchId) => setFilter("branchId", branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentId"
              initialValue={queryParams.departmentId || ""}
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
              name="productCategoryId"
              initialValue={queryParams.productCategoryId || ""}
              customOption={{
                value: "",
                label: "...Clear product category filter",
              }}
              onSelect={(categoryId) =>
                setFilter("productCategoryId", categoryId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Product</ControlLabel>
            <SelectProducts
              label="Choose product"
              name="productId"
              initialValue={queryParams.productId || ""}
              customOption={{
                value: "",
                label: "...Clear product filter",
              }}
              onSelect={(productId) => setFilter("productId", productId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Remainder</ControlLabel>
            <FormControl
              type="number"
              name={"remainder"}
              defaultValue={queryParams.remainder || 0}
              onChange={onChange}
            />
          </FormGroup>
        </List>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
