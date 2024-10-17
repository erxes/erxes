import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { router } from "@erxes/ui/src/utils";
import { __ } from "coreui/utils";
import { IFlowCategory } from "../../types";
import { Link } from "react-router-dom";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import { SidebarListItem } from "@erxes/ui-settings/src/styles";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import FormControl from "@erxes/ui/src/components/form/Control";
import { useLocation, useNavigate } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  flowCategories: IFlowCategory[];
  loading: boolean;
  flowCategoriesCount: number;
}

const List = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { categoryId: null });
  };

  const clearLocationFilter = () => {
    router.setParams(navigate, location, {
      branchId: null,
      departmentId: null,
    });
  };

  const clearStatusFilter = () => {
    router.setParams(navigate, location, { status: null, validation: null });
  };

  const isActive = (id: string) => {
    const { queryParams } = props;
    const currentGroup = queryParams.categoryId || "";

    return currentGroup === id;
  };

  const setFilter = (name, value) => {
    router.setParams(navigate, location, { [name]: value });
  };

  const renderContent = () => {
    const { flowCategories } = props;

    const result: React.ReactNode[] = [
      <SidebarListItem
        key={"unknownCategory"}
        $isActive={isActive("unknownCategory")}
      >
        <Link to={`?categoryId=${"unknownCategory"}`}>
          {__("!Unknown Category")}
        </Link>
      </SidebarListItem>,
    ];

    for (const category of flowCategories) {
      const order = category.order || "";

      const m = order.match(/[/]/gi);

      let space = "";

      if (m) {
        space = "\u00a0\u00a0".repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.name} (${category.flowCount || 0})`
      ) : (
        <span>
          {category.name} ({category.flowCount || 0})
        </span>
      );

      result.push(
        <SidebarListItem key={category._id} $isActive={isActive(category._id)}>
          <Link to={`?categoryId=${category._id}`}>
            {space}
            {name}
          </Link>
        </SidebarListItem>
      );
    }

    return result;
  };

  const renderCategoryHeader = () => {
    return (
      <Section.Title>
        {__("Categories")}

        <Section.QuickButtons>
          {router.getParam(location, "categoryId") && (
            <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
    );
  };

  const renderCategoryList = () => {
    const { flowCategoriesCount, loading } = props;

    return (
      <SidebarList>
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={flowCategoriesCount}
          emptyText={__("There is no flow category")}
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  };

  const { queryParams } = props;

  return (
    <Sidebar wide={true} hasBorder={true}>
      <Section maxHeight={488} $collapsible={props.flowCategoriesCount > 9}>
        {renderCategoryHeader()}
        {renderCategoryList()}
      </Section>
      <Section>
        <Section.Title>
          {__("Latest job location")}

          <Section.QuickButtons>
            {(router.getParam(location, "branchId") ||
              router.getParam(location, "departmentId")) && (
              <a href="#cancel" tabIndex={0} onClick={clearLocationFilter}>
                <Tip text={__("Clear filter")} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
        <SidebarList>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label={__("Choose branch")}
              name="selectedBranchId"
              initialValue={queryParams.branchId}
              customOption={{ value: "", label: "Skip branch" }}
              onSelect={(branchId) => setFilter("branchId", branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label={__("Choose department")}
              name="selectedDepartmentId"
              initialValue={queryParams.departmentId}
              customOption={{ value: "", label: "Skip department" }}
              onSelect={(departmentId) =>
                setFilter("departmentId", departmentId)
              }
              multi={false}
            />
          </FormGroup>
        </SidebarList>
      </Section>
      <Section>
        <Section.Title>
          {__("Status")}

          <Section.QuickButtons>
            {(router.getParam(location, "status") ||
              router.getParam(location, "validation")) && (
              <a href="#cancel" tabIndex={0} onClick={clearStatusFilter}>
                <Tip text={__("Clear filter")} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
        <SidebarList>
          <FormGroup>
            <ControlLabel>Status</ControlLabel>
            <FormControl
              name="status"
              componentclass="select"
              defaultValue={queryParams.status}
              required={false}
              onChange={(e) =>
                setFilter("status", (e.currentTarget as HTMLInputElement).value)
              }
            >
              <option key={""} value={""}>
                {" "}
                {"Not deleted"}{" "}
              </option>
              <option key={"active"} value={"active"}>
                {" "}
                {"active"}{" "}
              </option>
              <option key={"draft"} value={"draft"}>
                {" "}
                {"draft"}{" "}
              </option>
              <option key={"deleted"} value={"deleted"}>
                {" "}
                {"deleted"}{" "}
              </option>
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Validation</ControlLabel>
            <FormControl
              name="validation"
              componentclass="select"
              defaultValue={queryParams.validation}
              required={false}
              onChange={(e) =>
                setFilter(
                  "validation",
                  (e.currentTarget as HTMLInputElement).value
                )
              }
            >
              <option key={""} value={""}>
                {" "}
                {"Any validation"}{" "}
              </option>
              <option key={"true"} value={"true"}>
                {" "}
                {"true"}{" "}
              </option>
              <option key={"Has not jobs"} value={"Has not jobs"}>
                {" "}
                {"Has not jobs"}{" "}
              </option>
              <option
                key={"Has not endPoint job"}
                value={"Has not endPoint job"}
              >
                {" "}
                {"Has not endPoint job"}{" "}
              </option>
              <option key={"Many endPoint jobs"} value={"Many endPoint jobs"}>
                {" "}
                {"Many endPoint jobs"}{" "}
              </option>
              <option key={"Has not latest job"} value={"Has not latest job"}>
                {" "}
                {"Has not latest job"}{" "}
              </option>
              <option key={"Many latest jobs"} value={"Many latest jobs"}>
                {" "}
                {"Many latest jobs"}{" "}
              </option>
              <option key={"less products"} value={"less products"}>
                {" "}
                {"less products"}{" "}
              </option>
              <option
                key={"wrong Spend Department"}
                value={"wrong Spend Department"}
              >
                {" "}
                {"wrong Spend Department"}{" "}
              </option>
              <option key={"wrong Spend Branch"} value={"wrong Spend Branch"}>
                {" "}
                {"wrong Spend Branch"}{" "}
              </option>
            </FormControl>
          </FormGroup>
        </SidebarList>
      </Section>
    </Sidebar>
  );
};

export default List;
