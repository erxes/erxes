import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import moment from "moment";
import queryString from "query-string";
import React, { useState } from "react";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import Tip from "@erxes/ui/src/components/Tip";
import { router } from "@erxes/ui/src/utils";
import { __ } from "coreui/utils";
import { DateContainer } from "@erxes/ui/src/styles/main";
import { MenuFooter, SidebarFilters } from "../../styles";
import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import { IQueryParams } from "@erxes/ui/src/types";
import SelectJobRefer from "../../job/containers/refer/SelectJobRefer";
import { JOB_TYPE_CHOISES } from "../../constants";
import Button from "@erxes/ui/src/components/Button";
import { ScrolledContent } from "../../flow/styles";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

const generateQueryParams = () => {
  const location = useLocation();
  return queryString.parse(location.search);
};

const DetailLeftSidebar = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filterParams, setFilterParams] = useState<IQueryParams>(
    props.queryParams
  );

  const isFiltered = (): boolean => {
    const params = generateQueryParams();

    for (const param in params) {
      if (
        [
          "type",
          "startDate",
          "endDate",
          "jobReferId",
          "jobCategoryId",
          "productIds",
          "productCategoryId",
          "inBranchId",
          "inDepartmentId",
          "outBranchId",
          "outDepartmentId",
        ].includes(param)
      ) {
        return true;
      }
    }

    return false;
  };

  const gotoBack = () => {
    navigate(
      `/processes/overallWorks?${queryString.stringify({
        ...props.queryParams,
      })}`
    );
  };
  const clearFilter = () => {
    const params = generateQueryParams();
    router.removeParams(navigate, location, ...Object.keys(params));
  };

  const setFilter = (name, value) => {
    setFilterParams({ ...filterParams, [name]: value });
  };

  const onchangeType = (e) => {
    const value = (e.currentTarget as HTMLInputElement).value;

    const filters: IQueryParams = {
      ...filterParams,
      type: value,
    };

    delete filters.jobReferId;
    delete filters.productIds;
    delete filters.productCategoryId;

    setFilterParams(filters);
  };

  const onSelectDate = (value, name) => {
    const strVal = moment(value).format("YYYY-MM-DD HH:mm");
    setFilter(name, strVal);
  };

  const runFilter = () => {
    router.setParams(navigate, location, { ...filterParams });
  };

  const renderSpec = () => {
    if (!filterParams.type) {
      return "";
    }

    if (filterParams.type === "job") {
      return (
        <FormGroup>
          <ControlLabel>Job Refer</ControlLabel>
          <SelectJobRefer
            key={"JobReferJob"}
            label="Choose jobRefer"
            name="jobReferId"
            initialValue={filterParams.jobReferId || ""}
            customOption={{
              value: "",
              label: "...Clear jobRefer filter",
            }}
            onSelect={(jobReferId) => setFilter("jobReferId", jobReferId)}
            filterParams={{ types: ["job"] }}
            multi={false}
          />
        </FormGroup>
      );
    }

    if (filterParams.type === "end") {
      return (
        <FormGroup>
          <ControlLabel>Job Refer</ControlLabel>
          <SelectJobRefer
            key={"JobReferEnd"}
            label="Choose jobRefer"
            name="jobReferId"
            initialValue={filterParams.jobReferId || ""}
            customOption={{
              value: "",
              label: "...Clear jobRefer filter",
            }}
            onSelect={(jobReferId) => setFilter("jobReferId", jobReferId)}
            filterParams={{ types: ["end"] }}
            multi={false}
          />
        </FormGroup>
      );
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>{__("Product Category")}</ControlLabel>
          <SelectProductCategory
            label={__("Choose product category")}
            name="productCategoryId"
            initialValue={filterParams.productCategoryId || ""}
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
          <ControlLabel>{__("Product")}</ControlLabel>
          <SelectProducts
            label="Choose product"
            name="productIds"
            initialValue={filterParams.productIds || ""}
            customOption={{
              value: "",
              label: "...Clear product filter",
            }}
            onSelect={(productIds) => setFilter("productIds", productIds)}
            multi={true}
          />
        </FormGroup>
      </>
    );
  };

  return (
    <Wrapper.Sidebar hasBorder>
      <ScrolledContent>
        <Section.Title>
          {__("Filters")}
          <Section.QuickButtons>
            <a href="#gotoBack" tabIndex={0} onClick={gotoBack}>
              <Tip text={__("GoTo overall works")} placement="bottom">
                <Icon icon="left-arrow-to-left" />
              </Tip>
            </a>
            {isFiltered() && (
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
              <ControlLabel>Type</ControlLabel>
              <FormControl
                name="type"
                componentclass="select"
                value={filterParams.type}
                required={false}
                onChange={onchangeType}
              >
                <option value="">All type</option>
                {Object.keys(JOB_TYPE_CHOISES).map((jt) => (
                  <option value={jt} key={Math.random()}>
                    {JOB_TYPE_CHOISES[jt]}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            {renderSpec()}
            <FormGroup>
              <ControlLabel>{__("Spend Branch")}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="inBranchId"
                initialValue={filterParams.inBranchId || ""}
                customOption={{
                  value: "",
                  label: "...Clear branch filter",
                }}
                onSelect={(branchId) => setFilter("inBranchId", branchId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Spend Department")}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="inDepartmentId"
                initialValue={filterParams.inDepartmentId || ""}
                customOption={{
                  value: "",
                  label: "...Clear department filter",
                }}
                onSelect={(departmentId) =>
                  setFilter("inDepartmentId", departmentId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Receipt Branch")}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="outBranchId"
                initialValue={filterParams.outBranchId || ""}
                customOption={{
                  value: "",
                  label: "...Clear branch filter",
                }}
                onSelect={(branchId) => setFilter("outBranchId", branchId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Receipt Department")}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="outDepartmentId"
                initialValue={filterParams.outDepartmentId || ""}
                customOption={{
                  value: "",
                  label: "...Clear department filter",
                }}
                onSelect={(departmentId) =>
                  setFilter("outDepartmentId", departmentId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>{__(`Start Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startDate"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder={__("Choose date")}
                  value={filterParams.startDate || ""}
                  onChange={(value) => onSelectDate(value, "startDate")}
                />
              </DateContainer>
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>{__(`End Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="endDate"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder={__("Choose date")}
                  value={filterParams.endDate || ""}
                  onChange={(value) => onSelectDate(value, "endDate")}
                />
              </DateContainer>
            </FormGroup>
          </List>
          <MenuFooter>
            <Button
              block={true}
              btnStyle="success"
              uppercase={false}
              onClick={runFilter}
              icon="filter"
            >
              {__("Filter")}
            </Button>
          </MenuFooter>
        </SidebarFilters>
      </ScrolledContent>
    </Wrapper.Sidebar>
  );
};

export default DetailLeftSidebar;
