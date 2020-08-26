import { ButtonGroup } from "modules/boards/styles/header";
import Button from "modules/common/components/Button";
import DropdownToggle from "modules/common/components/DropdownToggle";
import { ControlLabel } from "modules/common/components/form";
import Icon from "modules/common/components/Icon";
import ModalTrigger from "modules/common/components/ModalTrigger";
import { __, Alert, confirm } from "modules/common/utils";
import CompaniesMerge from "modules/companies/components/detail/CompaniesMerge";
import CompanyForm from "modules/companies/containers/CompanyForm";
import { ICompany } from "modules/companies/types";
import TargetMerge from "modules/customers/components/common/TargetMerge";
import CustomersMerge from "modules/customers/components/detail/CustomersMerge";
import CustomerForm from "modules/customers/containers/CustomerForm";
import { Actions, MailBox, States } from "modules/customers/styles";
import { ICustomer } from "modules/customers/types";
import { Box } from "modules/settings/growthHacks/styles";
import MailForm from "modules/settings/integrations/containers/mail/MailForm";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

type Props = {
  coc: ICustomer | ICompany;
  cocType: string;
  remove: () => void;
  merge: (doc: { ids: string[]; data: ICustomer | ICompany }) => void;
  search: (value: string, callback: (objects: any[]) => void) => void;
  changeState?: (value: string) => void;
  isSmall?: boolean;
};
class ActionSection extends React.Component<Props, { customerState: string }> {
  constructor(props) {
    super(props);

    this.state = {
      customerState: props.cocType === "customer" ? props.coc.state : "",
    };
  }

  renderActions() {
    const { coc, cocType, isSmall } = this.props;
    const { primaryPhone, primaryEmail } = coc;

    const content = (props) => (
      <MailBox>
        <MailForm
          fromEmail={primaryEmail}
          refetchQueries={
            cocType === "customer"
              ? ["activityLogsCustomer"]
              : ["activityLogsCompany"]
          }
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    return (
      <>
        <ModalTrigger
          dialogClassName="middle"
          title="Email"
          trigger={
            <Button
              disabled={primaryEmail ? false : true}
              size="small"
              btnStyle={isSmall ? "link" : "primary"}
            >
              {__("Email")}
            </Button>
          }
          size="lg"
          content={content}
          paddingContent="no-padding"
          enforceFocus={false}
        />
        <Button
          href={primaryPhone && `tel:${primaryPhone}`}
          size="small"
          btnStyle={isSmall ? "link" : "primary"}
          disabled={primaryPhone ? false : true}
        >
          {__("Call")}
        </Button>
      </>
    );
  }

  renderButton() {
    const { isSmall } = this.props;

    return (
      <Button size="small" btnStyle={isSmall ? "link" : "primary"}>
        {__("Action")} <Icon icon="angle-down" />
      </Button>
    );
  }

  renderEditButton() {
    const { cocType, coc } = this.props;

    const customerForm = (props) => {
      return <CustomerForm {...props} size="lg" customer={coc} />;
    };

    const companyForm = (props) => {
      return <CompanyForm {...props} size="lg" company={coc} />;
    };

    return (
      <li>
        <ModalTrigger
          title="Edit basic info"
          trigger={<a href="#edit">{__("Edit")}</a>}
          size="lg"
          content={cocType === "company" ? companyForm : customerForm}
        />
      </li>
    );
  }

  renderBox(index, type, desc) {
    const { changeState } = this.props;

    if (!changeState) {
      return null;
    }

    const onClick = () => {
      this.setState({ customerState: type });
      changeState(type);
    };

    return (
      <Box
        key={index}
        selected={this.state.customerState === type}
        onClick={onClick}
      >
        <b>{type}</b>
        <p>{__(desc)}</p>
      </Box>
    );
  }

  renderChangeStateForm() {
    const options = [
      {
        value: "lead",
        desc: "A person who preparing to buy some service or product.",
      },
      {
        value: "customer",
        desc: "A person who already bought some service or product.",
      },
    ];

    const modalContent = () => {
      return (
        <>
          <ControlLabel>Change State</ControlLabel>
          <States>
            {options.map((option, index) =>
              this.renderBox(index, option.value, option.desc)
            )}
          </States>
        </>
      );
    };

    return (
      <ModalTrigger
        title={__("Change state")}
        trigger={<a href="#changeState">{__("Change state")}</a>}
        content={modalContent}
        hideHeader={true}
        centered={true}
      />
    );
  }

  renderDropdown() {
    const { remove, merge, cocType, search, coc } = this.props;

    const onClick = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const generateOptions = (customers) => {
      return customers.map((cus, key) => ({
        key,
        value: JSON.stringify(cus),
        label:
          cus.firstName ||
          cus.lastName ||
          cus.primaryEmail ||
          cus.primaryPhone ||
          "Unknown",
      }));
    };

    const targetMergeOptions = (companies) => {
      return companies.map((c, key) => ({
        key,
        value: JSON.stringify(c),
        label: c.primaryName || c.website || "Unknown",
      }));
    };

    return (
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-action">
          {this.renderButton()}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.renderEditButton()}
          <li>
            <TargetMerge
              onSave={merge}
              object={coc}
              searchObject={search}
              mergeForm={
                cocType === "customer" ? CustomersMerge : CompaniesMerge
              }
              generateOptions={
                cocType === "customer" ? generateOptions : targetMergeOptions
              }
            />
          </li>
          <li>
            <a href="#delete" onClick={onClick}>
              {__("Delete")}
            </a>
          </li>
          <li>{this.renderChangeStateForm()}</li>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const { isSmall } = this.props;

    const content = (
      <>
        {this.renderActions()}
        {this.renderDropdown()}
      </>
    );

    if (isSmall) {
      return (
        <Actions isSmall={true}>
          <ButtonGroup>{content}</ButtonGroup>
        </Actions>
      );
    }

    return <Actions>{content}</Actions>;
  }
}

export default ActionSection;
