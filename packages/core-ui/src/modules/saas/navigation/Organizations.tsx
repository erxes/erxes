import * as React from "react";

import { Add, Container, ExistingOrg, List } from "./styles";

import { Divider } from "@erxes/ui-sales/src/boards/styles/stage";
import { IUserOrganization } from "@erxes/ui/src/auth/types";
import Icon from "modules/common/components/Icon";
import { __ } from "modules/common/utils";

type Props = {
  organizations: IUserOrganization[];
};

class Organizations extends React.PureComponent<Props> {
  getDomain() {
    return window.location.host.split(".")[0];
  }

  createLink(subdomain: string) {
    const domain = window.location.host.replace(this.getDomain(), subdomain);
    return `${window.location.protocol}//${domain}`;
  }

  getCurrentOrganizationName() {
    const { organizations } = this.props;
    const current = organizations.filter(
      o => o.subdomain === this.getDomain()
    )[0];

    return current && current.name;
  }

  render() {
    const { organizations } = this.props;

    if (organizations.length === 0) {
      return (
        <Add href="https://erxes.io/onboarding" target="_blank">
          {__("Create a new organization")}
          <span>{__("No organizations")}</span>
        </Add>
      );
    }

    return (
      <Container>
        <ExistingOrg as="div">
          {this.getCurrentOrganizationName()}
          <span>{__("Create or switch organization")}</span>
        </ExistingOrg>
        <List>
          {organizations.map(o => {
            const isCurrent = o.subdomain === this.getDomain();
            return (
              <li key={Math.random()} className={isCurrent ? "active" : ""}>
                <a href={this.createLink(o.subdomain)}>
                  {o.name}
                  {isCurrent && <Icon icon="check-1" size={16} />}
                </a>
              </li>
            );
          })}
          <Divider />
          <li>
            <a href="https://erxes.io/onboarding">
              {__("Create a new organization")}
            </a>
          </li>
        </List>
      </Container>
    );
  }
}

export default Organizations;
