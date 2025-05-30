import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";
import { Icon, Tip } from "@erxes/ui/src/components";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import React from "react";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { SidebarFilters } from "../../common/styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
}

const AgentFilter = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const clearFilter = () => {
    router.setParams(navigate, location, {
      customerIds: null,
      status: null,
      companyIds: null,
    });
  };

  const setFilter = (name, value) => {
    router.setParams(navigate, location, { [name]: value });
  };

  const { queryParams: qp } = props;

  return (
    <Sidebar>
      <Section $collapsible={false}>
        <Section.Title>
          {__("Additional filters")}
          <Section.QuickButtons>
            {(qp.status || qp.customerIds || qp.companyIds) && (
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
            <ControlLabel>{__('Status')}</ControlLabel>
            <FormControl
              name="status"
              componentclass="select"
              defaultValue={qp.status || ""}
              required={false}
              onChange={(e) =>
                setFilter("status", (e.currentTarget as HTMLInputElement).value)
              }
            >
              <option key={""} value={""}>
                {"All status"}
              </option>
              <option key={"active"} value={"active"}>
                {"Active"}
              </option>
              <option key={"draft"} value={"draft"}>
                {"Draft"}
              </option>
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Customers')}</ControlLabel>
            <SelectCustomers
              customOption={{
                value: "",
                label: "All customers",
              }}
              label="Customers"
              name="customerIds"
              multi={true}
              initialValue={qp.customerIds || []}
              onSelect={(customerId) => setFilter("customerIds", customerId)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Companies')}</ControlLabel>
            <SelectCompanies
              customOption={{
                value: "",
                label: "All companies",
              }}
              label="Companies"
              name="companyIds"
              multi={true}
              initialValue={qp.companyIds || []}
              onSelect={(companyId) => setFilter("companyIds", companyId)}
            />
          </FormGroup>
        </SidebarFilters>
      </Section>
    </Sidebar>
  );
};

export default AgentFilter;
