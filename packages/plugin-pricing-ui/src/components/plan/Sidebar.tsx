import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import { STATUS_FILTER_OPTIONS } from "../../constants";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { SidebarFilters } from "../../styles";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  params: any;
};

const { Section } = Wrapper.Sidebar;

export default function Sidebar(props: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState(props.params);
  const {
    productId,
    branchId,
    departmentId,
    status,
    prioritizeRule,
    date,
    isQuantityEnabled,
    isPriceEnabled,
    isExpiryEnabled,
    isRepeatEnabled,
  } = filters;

  const clearFilter = () => {
    router.removeParams(
      navigate,
      location,
      "productId",
      "branchId",
      "departmentId",
      "date",
      "status",
      "prioritizeRule",
      "isQuantityEnabled",
      "isPriceEnabled",
      "isExpiryEnabled",
      "isRepeatEnabled",
      "page"
    );
  };

  const runFilter = () => {
    router.setParams(navigate, location, { ...filters });
  };

  const setFilter = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <Wrapper.Sidebar hasBorder>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {(branchId || departmentId || productId || date) && (
            <a href="#cancel" tabIndex={0} onClick={clearFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <SidebarFilters>
        <FormGroup>
          <ControlLabel>Status</ControlLabel>
          <FormControl
            componentclass="select"
            name="status"
            defaultValue={status || ""}
            onChange={(e) => setFilter("status", (e.target as any).value)}
          >
            {STATUS_FILTER_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="branchId"
            initialValue={branchId || ""}
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
            label={__("Choose department")}
            name="departmentId"
            initialValue={departmentId || ""}
            customOption={{
              value: "",
              label: "...Clear department filter",
            }}
            onSelect={(departmentId) => setFilter("departmentId", departmentId)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Product</ControlLabel>
          <SelectProducts
            label={__("Choose product")}
            name="productId"
            initialValue={productId || ""}
            customOption={{
              value: "",
              label: "...Clear product filter",
            }}
            onSelect={(productId) => setFilter("productId", productId)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>prioritize Rule</ControlLabel>
          <FormControl
            componentclass="select"
            name="prioritizeRule"
            defaultValue={prioritizeRule || ""}
            onChange={(e) =>
              setFilter("prioritizeRule", (e.target as any).value)
            }
          >
            {["", "only", "exclude"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Date</ControlLabel>
          <DateControl
            value={date}
            timeFormat={"HH:mm"}
            name="date"
            placeholder={__("date")}
            dateFormat={"YYYY-MM-DD"}
            onChange={(date: any) =>
              setFilter("date", dayjs(date).format("YYYY-MM-DD HH:mm"))
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Quantity Enabled</ControlLabel>
          <FormControl
            componentclass="checkbox"
            name="isQuantityEnabled"
            defaultChecked={isQuantityEnabled || false}
            onChange={(e) =>
              setFilter("isQuantityEnabled", (e.target as any).checked)
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Price Enabled</ControlLabel>
          <FormControl
            componentclass="checkbox"
            name="isPriceEnabled"
            defaultChecked={isPriceEnabled || false}
            onChange={(e) =>
              setFilter("isPriceEnabled", (e.target as any).checked)
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Expiry Enabled</ControlLabel>
          <FormControl
            componentclass="checkbox"
            name="isExpiryEnabled"
            defaultChecked={isExpiryEnabled || false}
            onChange={(e) =>
              setFilter("isExpiryEnabled", (e.target as any).checked)
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Repeat Enabled</ControlLabel>
          <FormControl
            componentclass="checkbox"
            name="isRepeatEnabled"
            defaultChecked={isRepeatEnabled || false}
            onChange={(e) =>
              setFilter("isRepeatEnabled", (e.target as any).checked)
            }
          />
        </FormGroup>
        <Button onClick={runFilter}>Filter</Button>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
}
