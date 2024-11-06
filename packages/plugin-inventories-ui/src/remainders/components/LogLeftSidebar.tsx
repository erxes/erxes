import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils/core";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Datetime from "@nateradebaugh/react-datetime";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import { SidebarList as List } from "@erxes/ui/src/layout";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { SidebarFilters } from "../../styles";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import moment from "moment";

const { Section } = Wrapper.Sidebar;

type Props = {
  handlePrint: () => void;
};

const LogLeftSidebar = (props: Props) => {
  const { handlePrint } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [filterParams, setFilterParams] = useState<any>({
    categoryId: router.getParam(location, "categoryId"),
    productIds: router.getParam(location, "productIds"),
    branchId: router.getParam(location, "branchId"),
    departmentId: router.getParam(location, "departmentId"),
    beginDate: router.getParam(location, "beginDate"),
    endDate: router.getParam(location, "endDate"),
    isDetailed: router.getParam(location, "isDetailed"),
  });

  const categoryId = (filterParams || {}).categoryId;
  const productIds = (filterParams || {}).productIds;
  const branchId = (filterParams || {}).branchId;
  const departmentId = (filterParams || {}).departmentId;
  const beginDate = (filterParams || {}).beginDate;
  const endDate = (filterParams || {}).endDate;
  const isDetailed = (filterParams || {}).isDetailed;

  const clearFilter = () => {
    router.setParams(navigate, location, {
      categoryId: null,
      branchId: null,
      departmentId: null,
      productIds: null,
      endDate: null,
      beginDate: null,
    });
  };

  const setFilter = (key, value) => {
    setFilterParams({ ...filterParams, [key]: value });
  };

  const runFilter = () => {
    router.setParams(navigate, location, {
      ...filterParams,
      isDetailed: filterParams.isDetailed ? true : undefined,
    });
  };

  return (
    <Wrapper.Sidebar>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {(branchId ||
            departmentId ||
            categoryId ||
            (productIds || []).length ||
            endDate ||
            beginDate) && (
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
            <ControlLabel>{__("Begin Date")}</ControlLabel>
            <Datetime
              inputProps={{ placeholder: "Click to select a date" }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              viewMode={"days"}
              utc={true}
              value={beginDate || null}
              onChange={(date) =>
                setFilter("beginDate", moment(date).format("YYYY/MM/DD HH:mm"))
              }
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("End Date")}</ControlLabel>
            <Datetime
              inputProps={{ placeholder: __("Click to select a date") }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              viewMode={"days"}
              utc={true}
              value={endDate || null}
              onChange={(date) =>
                setFilter("endDate", moment(date).format("YYYY/MM/DD HH:mm"))
              }
            />
          </FormGroup>
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
                label: __("...Clear department filter"),
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
              label={__("Choose product category")}
              name="categoryId"
              initialValue={categoryId || ""}
              customOption={{
                value: "",
                label: __("...Clear product category filter"),
              }}
              onSelect={(categoryId) => setFilter("categoryId", categoryId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Products</ControlLabel>
            <SelectProducts
              label={__("Choose product")}
              name="productIds"
              initialValue={productIds}
              customOption={{
                value: "",
                label: __("...Clear product filter"),
              }}
              onSelect={(productIds) => setFilter("productIds", productIds)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Is Detailed</ControlLabel>
            <FormControl
              defaultChecked={isDetailed}
              name="isDetailed"
              componentclass="checkbox"
              onChange={(e) =>
                setFilter("isDetailed", (e.target as any).checked)
              }
            />
          </FormGroup>
        </List>
        <Button btnStyle="success" onClick={runFilter} block>
          {__("Filter")}
        </Button>
        <br />
        <Button btnStyle="primary" onClick={handlePrint} block>
          {__("Print")}
        </Button>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
};

export default LogLeftSidebar;
