import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import { __, router } from "@erxes/ui/src/utils";
import React, { useRef } from "react";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import { SidebarFilters } from "../../styles";
import Icon from "@erxes/ui/src/components/Icon";
import Tip from "@erxes/ui/src/components/Tip";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

const YearPlanSidebar = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const timerRef = useRef<number | null>(null);

  const clearFilter = () => {
    router.removeParams(
      navigate,
      location,
      "year",
      "filterStatus",
      "branchId",
      "departmentId",
      "productCategoryId",
      "productId"
    );
  };

  const setFilter = (name, value) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { [name]: value });
  };

  const onInputChange = (e) => {
    e.preventDefault();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
    const name = e.target.name;
    timerRef.current = window.setTimeout(() => {
      setFilter(name, value);
    }, 500);
  };

  return (
    <Wrapper.Sidebar hasBorder>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {(router.getParam(location, "filterStatus") ||
            router.getParam(location, "branchId") ||
            router.getParam(location, "departmentId") ||
            router.getParam(location, "productCategoryId") ||
            router.getParam(location, "productId") ||
            router.getParam(location, "year")) && (
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
            <ControlLabel required={true}>{__(`Year`)}</ControlLabel>
            <FormControl
              type="number"
              name="year"
              placeholder='all year is "0"'
              defaultValue={queryParams.year || new Date().getFullYear()}
              onChange={onInputChange}
            />
          </FormGroup>
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
            <ControlLabel>Status</ControlLabel>
            <FormControl
              name="filterStatus"
              componentclass="select"
              defaultValue={queryParams.filterStatus}
              required={false}
              onChange={(e) =>
                setFilter(
                  "filterStatus",
                  (e.currentTarget as HTMLInputElement).value
                )
              }
            >
              <option key={""} value={""}>
                {" "}
                {"All status"}{" "}
              </option>
              <option key={"active"} value={"active"}>
                {" "}
                {"active"}{" "}
              </option>
              <option key={"archived"} value={"archived"}>
                {" "}
                {"archived"}{" "}
              </option>
            </FormControl>
          </FormGroup>
        </List>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
};

export default YearPlanSidebar;
