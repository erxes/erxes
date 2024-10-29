import { FlexContent, FlexItem } from "@erxes/ui/src/layout/styles";
import React, { useRef } from "react";
import { __, router } from "@erxes/ui/src/utils/core";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import CommonForm from "@erxes/ui/src/components/form/Form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Datetime from "@nateradebaugh/react-datetime";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { SidebarContent } from "../../styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import moment from "moment";
import queryString from "query-string";

export default function Sidebar() {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  // Methods
  const setFilter = (name: string, value: any) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { [name]: value });
  };

  const clearFilter = () => {
    router.removeParams(navigate, location, "beginDate");
    router.removeParams(navigate, location, "endDate");
    router.removeParams(navigate, location, "branchId");
    router.removeParams(navigate, location, "departmentId");
    router.removeParams(navigate, location, "productId");
  };

  const isFiltered = (): boolean => {
    if (
      router.getParam(location, "beginDate") ||
      router.getParam(location, "endDate") ||
      router.getParam(location, "branchId") ||
      router.getParam(location, "departmentId") ||
      router.getParam(location, "productId")
    )
      return true;

    return false;
  };

  const handleChangeDate = (label: string, date: any) => {
    const _date = moment(date).format("YYYY/MM/DD HH:mm");
    setFilter(label, _date);
  };

  const renderContent = () => (
    <FlexContent>
      <FlexItem>
        <FormGroup>
          <ControlLabel>{__("Begin Date")}</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __("Click to select a date") }}
            dateFormat="YYYY MM DD"
            timeFormat=""
            viewMode={"days"}
            closeOnSelect
            utc
            input
            value={queryParams.beginDate || null}
            onChange={(date) => handleChangeDate("beginDate", date)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("End Date")}</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __("Click to select a date") }}
            dateFormat="YYYY MM DD"
            timeFormat=""
            viewMode={"days"}
            closeOnSelect
            utc
            input
            value={queryParams.endDate || null}
            onChange={(date) => handleChangeDate("endDate", date)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Branch")}</ControlLabel>
          <SelectBranches
            label={__("Choose branch")}
            name="selectedBranchIds"
            initialValue={queryParams.branchId}
            onSelect={(branchId) => setFilter("branchId", branchId)}
            multi={false}
            customOption={{ value: "", label: __("All branches") }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Department")}</ControlLabel>
          <SelectDepartments
            label={__("Choose department")}
            name="selectedDepartmentIds"
            initialValue={queryParams.departmentId}
            onSelect={(departmentId) => setFilter("departmentId", departmentId)}
            multi={false}
            customOption={{ value: "", label: __("All departments") }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Product")}</ControlLabel>
          <SelectProducts
            label={__("Choose product")}
            name="selectedProductId"
            initialValue={queryParams.productId}
            onSelect={(productId) => setFilter("productId", productId)}
            multi={false}
            customOption={{ value: "", label: __("All products") }}
          />
        </FormGroup>
      </FlexItem>
    </FlexContent>
  );

  const renderExtraButtons = () => (
    <a href="#cancel" tabIndex={0} onClick={clearFilter}>
      <Icon icon="cancel-1" />
    </a>
  );

  return (
    <Wrapper.Sidebar>
      <Box
        title={__("Filters")}
        isOpen={true}
        name="showFilters"
        extraButtons={isFiltered() && renderExtraButtons()}
      >
        <SidebarContent>
          <CommonForm renderContent={renderContent} />
        </SidebarContent>
      </Box>
    </Wrapper.Sidebar>
  );
}
