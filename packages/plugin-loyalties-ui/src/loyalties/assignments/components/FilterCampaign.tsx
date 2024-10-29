import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";
import { Icon, Tip } from "@erxes/ui/src/components";
import { Sidebar, Wrapper } from "@erxes/ui/src/layout";
import { __, router } from "@erxes/ui/src/utils";

import React from "react";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { SidebarFilters } from "../../common/styles";
import { useLocation, useNavigate } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
}

const FilterCampaign = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, {
      ownerId: null,
      ownerType: null,
      status: null,
    });
  };

  const setFilter = (name, value) => {
    router.setParams(navigate, location, { [name]: value });
  };

  const { queryParams } = props;
  return (
    <Sidebar>
      <Section maxHeight={188} $collapsible={false}>
        <Section.Title>
          {__("Addition filters")}
          <Section.QuickButtons>
            {(router.getParam(location, "status") ||
              router.getParam(location, "ownerType") ||
              router.getParam(location, "ownerID")) && (
              <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
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
                {"All status"}{" "}
              </option>
              <option key={"new"} value={"new"}>
                {" "}
                {"new"}{" "}
              </option>
              <option key={"used"} value={"used"}>
                {" "}
                {"used"}{" "}
              </option>
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Customer</ControlLabel>
            <SelectCustomers
              customOption={{
                value: "",
                label: __("All customers"),
              }}
              label="Customer"
              name="ownerId"
              multi={false}
              initialValue={queryParams.ownerId}
              onSelect={(customerId) => setFilter("ownerId", customerId)}
            />
          </FormGroup>
        </SidebarFilters>
      </Section>
    </Sidebar>
  );
};

export default FilterCampaign;
