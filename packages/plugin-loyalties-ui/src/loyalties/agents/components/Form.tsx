import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  DateControl
} from "@erxes/ui/src/components";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { IAgent } from "../types";
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleDateContainer as DateContainer,
} from "@erxes/ui/src/styles/eindex";

import React from "react";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import { __ } from "@erxes/ui/src/utils";
import SelectProductRules from "@erxes/ui-products/src/containers/SelectProductRules";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  agent: IAgent;
  closeModal: () => void;
  queryParams: any;
};

type State = {
  agent: IAgent;
};

class AgentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const initialValue = {
      hasReturn: false,
      status: 'draft',
      prepaidPercent: 0,
      discountPercent: 0
    };

    const { agent = initialValue as IAgent } = props;

    this.state = { agent };
  }

  onChangeInput = (e) => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === "number") {
      value = Number(value);
    }

    this.setState({ agent: { ...this.state.agent, [name]: value } } as any);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} onChange={this.onChangeInput} />
      </FormGroup>
    );
  };

  onChangeSelect = (value, name) => {
    const { agent } = this.state;

    this.setState({ agent: { ...agent, [name]: value } });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({
      agent: { ...this.state.agent, [type]: date },
    });
  };

  onInputChange = (e) => {
    e.preventDefault();

    let value = e.target.value;
    const name = e.target.name;

    // number input & status select has this handler
    if (!(name === 'status' || name === 'number')) {
      value = parseFloat(value);
    }

    this.setState({
      agent: { ...this.state.agent, [name]: value },
    });
  };

  onCheckboxChange = (e: React.FormEvent) => {
    const event = e as React.ChangeEvent<HTMLInputElement>;
    const checked = event.target.checked;
    const updated: any = { ...this.state.agent, hasReturn: checked };

    this.setState({ agent: updated });
  }

  renderNumberFields = (formProps, label: string, fieldName: string, defaultValue: number | undefined) => {
    return (
      <FormColumn>
        <FormGroup>
          <ControlLabel>{label}</ControlLabel>
          <FormControl
            {...formProps}
            name={fieldName}
            type="number"
            min={0}
            max={100}
            onChange={this.onInputChange}
            defaultValue={defaultValue}
          />
        </FormGroup>
      </FormColumn>
    );
  }

  renderDateFields = (formProps, label: string, fieldName: string, defaultValue: Date | undefined, format?: string) => {
    return (
      <FormColumn>
        <FormGroup>
          <ControlLabel>{label}</ControlLabel>
          <DateContainer>
            <DateControl
              {...formProps}
              name={fieldName}
              placeholder={__(label)}
              value={defaultValue}
              onChange={(val) => this.onDateInputChange(fieldName, val)}
              dateFormat={format}
            />
          </DateContainer>
        </FormGroup>
      </FormColumn>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { agent } = this.state;
    const { closeModal, renderButton } = this.props;
    const { isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Number</ControlLabel>
                <FormControl
                  {...formProps}
                  name="number"
                  defaultValue={agent.number || ''}
                  required={true}
                  onChange={this.onInputChange}
                >
                </FormControl>
              </FormGroup>
            </FormColumn>

            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Status</ControlLabel>
                <FormControl
                  {...formProps}
                  name="status"
                  componentclass="select"
                  defaultValue={agent.status || 'active'}
                  required={true}
                  onChange={this.onInputChange}
                >
                  {["active", "draft"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Relevant customers</ControlLabel>
                <SelectCustomers
                  label="Choose customers"
                  name="customerIds"
                  multi={true}
                  initialValue={agent.customerIds}
                  onSelect={this.onChangeSelect}
                />
              </FormGroup>
            </FormColumn>

            <FormColumn>
              <FormGroup>
                <ControlLabel>Relevant companies</ControlLabel>
                <SelectCompanies
                  label="Choose companies"
                  name="companyIds"
                  multi={true}
                  initialValue={agent.companyIds}
                  onSelect={this.onChangeSelect}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormGroup>
            <ControlLabel>Has Return</ControlLabel>
            <FormControl
              {...formProps}
              name="hasReturn"
              type="checkbox"
              componentclass="checkbox"
              onChange={this.onCheckboxChange}
              defaultChecked={agent.hasReturn}
            />
          </FormGroup>

          <FormWrapper>
            {agent.hasReturn ? this.renderNumberFields(formProps, 'Return Amount', 'returnAmount', agent.returnAmount) : null}
            {agent.hasReturn ? this.renderNumberFields(formProps, 'Return Percent', 'returnPercent', agent.returnPercent) : null}
            {!agent.hasReturn ? this.renderNumberFields(formProps, 'Prepaid Percent', 'prepaidPercent', agent.prepaidPercent) : null}
            {!agent.hasReturn ? this.renderNumberFields(formProps, 'Discount Percent', 'discountPercent', agent.discountPercent) : null}
          </FormWrapper>

          <FormWrapper>
            {this.renderDateFields(formProps, 'Start Date', 'startDate', agent.startDate)}
            {this.renderDateFields(formProps, 'End Date', 'endDate', agent.endDate)}
          </FormWrapper>

          <FormWrapper>
            {this.renderDateFields(formProps, 'Start Month', 'startMonth', agent.startMonth, 'M')}
            {this.renderDateFields(formProps, 'End Month', 'endMonth', agent.endMonth, 'M')}
          </FormWrapper>

          <FormWrapper>
            {this.renderDateFields(formProps, 'Start Day', 'startDay', agent.startDay, 'D')}
            {this.renderDateFields(formProps, 'End Day', 'endDay', agent.endDay, 'D')}
          </FormWrapper>

          <FormGroup>
            <ControlLabel>Choose product rules</ControlLabel>
            <SelectProductRules
              label="Choose product rule"
              name="productRuleIds"
              multi={true}
              onSelect={this.onChangeSelect}
              initialValue={agent.productRuleIds}
            />
          </FormGroup>

        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: "agent",
            values: agent,
            isSubmitted,
            object: agent,
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default AgentForm;
