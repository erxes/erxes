import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { router, __ } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import queryString from "query-string";
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { SidebarContent } from "../../styles";

type Props = {
  safeRemainder: any;
};

export default function Sidebar(props: Props) {
  const { safeRemainder } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const setFilter = (name: string, value: string) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { [name]: value });
  };

  const statusOptions = [
    { label: "All", value: "" },
    { label: "New", value: "new" },
    { label: "Checked", value: "checked" },
  ];

  const diffOptions = [
    { label: "Тэнцүү", value: "eq" },
    { label: "Их", value: "gt" },
    { label: "Бага", value: "lt" },
  ];

  return (
    <Wrapper.Sidebar>
      <Box title={__("Main Info")} name="showMainInfo" isOpen={true}>
        <SidebarContent>
          <FormGroup>
            <ControlLabel>{__("Date")}: </ControlLabel>
            <br />
            <span>{dayjs(safeRemainder.date).format("lll") || ""}</span>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Description")}: </ControlLabel>
            <br />
            <span>{safeRemainder.description || ""}</span>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Branch")}: </ControlLabel>
            <br />
            <span>{safeRemainder.branch && safeRemainder.branch.title}</span>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Department")}: </ControlLabel>
            <br />
            <span>
              {safeRemainder.department && safeRemainder.department.title}
            </span>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Product Category")}: </ControlLabel>
            <br />
            <span>
              {safeRemainder.productCategory &&
                `${safeRemainder.productCategory.code} - ${safeRemainder.productCategory.name}`}
            </span>
          </FormGroup>
        </SidebarContent>
      </Box>
      <Box title={__("Filters")} name="showFilters" isOpen={true}>
        <SidebarContent>
          <FormGroup>
            <ControlLabel>{__("Product category")}</ControlLabel>
            <SelectProductCategory
              label={__("Choose product category")}
              name="selectedProductCategoryIds"
              initialValue={queryParams.productCategoryIds}
              onSelect={(catIds: any) =>
                setFilter("productCategoryIds", catIds)
              }
              multi={true}
              customOption={{ value: "", label: "All products" }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Diff Type")}</ControlLabel>
            <Select
              options={diffOptions}
              value={diffOptions.filter((o) =>
                (queryParams.diffType || "").split(",").includes(o.value)
              )}
              onChange={(options: any) =>
                setFilter(
                  "diffType",
                  (options || []).map((o) => o.value).join(",")
                )
              }
              isMulti={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Status")}</ControlLabel>
            <Select
              options={statusOptions}
              value={statusOptions.find(
                (o) => o.value === (queryParams.status || "")
              )}
              isClearable={true}
              onChange={(option: any) => setFilter("status", option.value)}
            />
          </FormGroup>
        </SidebarContent>
      </Box>
      <Link
        to={`/inventories/safe-remainders/detailsPrint/${props.safeRemainder._id}/${location.search}`}
      >
        <Button btnStyle="success" icon="check-circle" size="small">
          {__("Print")}
        </Button>
      </Link>
      &nbsp;
      <Link
        to={`/inventories/safe-remainders/detailsPrintDoc/${props.safeRemainder._id}/${location.search}`}
      >
        <Button btnStyle="success" icon="check-circle" size="small">
          {__("Print Doc")}
        </Button>
      </Link>
    </Wrapper.Sidebar>
  );
}
