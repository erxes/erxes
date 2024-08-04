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
import SelectJobCategory from "../../job/containers/category/SelectJobCategory";
import SelectJobRefer from "../../job/containers/refer/SelectJobRefer";
import { JOB_TYPE_CHOISES } from "../../constants";
import Button from "@erxes/ui/src/components/Button";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

const generateQueryParams = location => {
  return queryString.parse(location.search);
};

const Sidebar = (props: Props) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();
  const [filterParams, setFilterParams] = useState<IQueryParams>(
    props.queryParams
  );

  const isFiltered = (): boolean => {
    const params = generateQueryParams(location);

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
          "outDepartmentId"
        ].includes(param)
      ) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, ...Object.keys(params));
  };

  const setFilter = (name, value) => {
    setFilterParams({ ...filterParams, [name]: value });
  };

  const onInputChange = e => {
    e.preventDefault();

    if (timer) {
      clearTimeout(timer);
    }

    const value = e.target.value;
    const name = e.target.name;
    timer = setTimeout(() => {
      setFilter(name, value);
    }, 500);
  };

  const onSelectDate = (value, name) => {
    const strVal = moment(value).format("YYYY-MM-DD HH:mm");
    setFilter(name, strVal);
  };

  const runFilter = () => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { ...filterParams });
  };

  const renderSpec = () => {
    if (!filterParams.type) {
      return "";
    }

    if (["end", "job"].includes(filterParams.type)) {
      return (
        <>
          <FormGroup>
            <ControlLabel>Job Category</ControlLabel>
            <SelectJobCategory
              label="Choose product category"
              name="productCategoryId"
              initialValue={filterParams.productCategoryId || ""}
              customOption={{
                value: "",
                label: "...Clear product category filter"
              }}
              onSelect={categoryId =>
                setFilter("productCategoryId", categoryId)
              }
              multi={false}
            />
          </FormGroup>
          {(filterParams.type === "end" && (
            <FormGroup>
              <ControlLabel>Job Refer</ControlLabel>
              <SelectJobRefer
                key={"jobReferEnds"}
                label="Choose jobRefer"
                name="jobReferId"
                initialValue={filterParams.jobReferId || ""}
                customOption={{
                  value: "",
                  label: "...Clear jobRefer filter"
                }}
                onSelect={jobReferId => setFilter("jobReferId", jobReferId)}
                filterParams={{ types: ["end"] }}
                multi={false}
              />
            </FormGroup>
          )) || (
            <FormGroup>
              <ControlLabel>Job Refer</ControlLabel>
              <SelectJobRefer
                key={"jobReferJobs"}
                label="Choose jobRefer"
                name="jobReferId"
                initialValue={filterParams.jobReferId || ""}
                customOption={{
                  value: "",
                  label: "...Clear jobRefer filter"
                }}
                onSelect={jobReferId => setFilter("jobReferId", jobReferId)}
                filterParams={{ types: ["job"] }}
                multi={false}
              />
            </FormGroup>
          )}
        </>
      );
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Product Category</ControlLabel>
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={filterParams.productCategoryId || ""}
            customOption={{
              value: "",
              label: "...Clear product category filter"
            }}
            onSelect={categoryId => setFilter("productCategoryId", categoryId)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Product</ControlLabel>
          <SelectProducts
            label="Choose product"
            name="productIds"
            initialValue={filterParams.productIds || []}
            customOption={{
              value: "",
              label: "...Clear product filter"
            }}
            onSelect={productIds => setFilter("productIds", productIds)}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Vendor</ControlLabel>
          <SelectCompanies
            label="Choose vendor"
            name="vendorIds"
            initialValue={filterParams.vendorIds || []}
            customOption={{
              value: "",
              label: "...Clear product filter"
            }}
            onSelect={vendorIds => setFilter("vendorIds", vendorIds)}
            multi={true}
          />
        </FormGroup>
      </>
    );
  };

  return (
    <Wrapper.Sidebar hasBorder>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
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
              onChange={e =>
                setFilter("type", (e.currentTarget as HTMLInputElement).value)
              }
            >
              <option value="">All type</option>
              {Object.keys(JOB_TYPE_CHOISES).map(jt => (
                <option value={jt} key={Math.random()}>
                  {JOB_TYPE_CHOISES[jt]}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          {renderSpec()}
          <FormGroup>
            <ControlLabel>Spend Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="inBranchId"
              initialValue={filterParams.inBranchId || ""}
              customOption={{
                value: "",
                label: "...Clear branch filter"
              }}
              onSelect={branchId => setFilter("inBranchId", branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Spend Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="inDepartmentId"
              initialValue={filterParams.inDepartmentId || ""}
              customOption={{
                value: "",
                label: "...Clear department filter"
              }}
              onSelect={departmentId =>
                setFilter("inDepartmentId", departmentId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Receipt Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="outBranchId"
              initialValue={filterParams.outBranchId || ""}
              customOption={{
                value: "",
                label: "...Clear branch filter"
              }}
              onSelect={branchId => setFilter("outBranchId", branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Receipt Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="outDepartmentId"
              initialValue={filterParams.outDepartmentId || ""}
              customOption={{
                value: "",
                label: "...Clear department filter"
              }}
              onSelect={departmentId =>
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
                placeholder="Choose date"
                value={
                  filterParams.startDate ||
                  moment(new Date(new Date().setHours(0, 0, 0)))
                }
                onChange={value => onSelectDate(value, "startDate")}
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
                placeholder="Choose date"
                value={
                  filterParams.endDate ||
                  moment(
                    new Date(new Date().setHours(0, 0, 0) + 24 * 60 * 60 * 1000)
                  )
                }
                onChange={value => onSelectDate(value, "endDate")}
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
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
