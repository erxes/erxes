import * as path from 'path';

import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger,
  SelectTeamMembers
} from '@erxes/ui/src';
import { ModalFooter, ScrollWrapper } from '@erxes/ui/src/styles/main';

import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const SelectCompanies = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCompanies" */ '@erxes/ui-contacts/src/companies/containers/SelectCompanies'
    )
);

const SelectCustomers = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCustomers" */ '@erxes/ui-contacts/src/customers/containers/SelectCustomers'
    )
);

interface LayoutProps {
  children: React.ReactNode;
  label: string;
}
type Props = {
  renderBtn: (props: any) => JSX.Element;
};
type State = {
  ownerType: string;
  ownerId: string;
  changeScore: number;
};

class ScoreForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      ownerType: '',
      ownerId: '',
      changeScore: 0
    };
  }

  render() {
    const { ownerType, ownerId } = this.state;
    const { renderBtn } = this.props;

    let changeScore = 0;

    const ownerTypeInput = ['customer', 'user', 'company'];

    const handleOwnerType = e => {
      const target = e.currentTarget as HTMLInputElement;
      const value = target.value;
      const name = target.name;
      this.setState(prev => ({ ...prev, [name]: value }));
    };

    const handleOwnerId = id => {
      this.setState(prev => ({ ...prev, ownerId: id }));
    };

    const handleScore = e => {
      const value = parseInt(e.target.value);
      // this.setState(prev=>({...prev,changeScore:value}))
      changeScore = value;
    };

    const generateDoc = () => {
      return {
        ownerType,
        ownerId,
        createdBy: new Date(),
        changeScore
      };
    };

    const renderOwner = () => {
      if (isEnabled('contacts') && ownerType === 'customer') {
        return (
          <SelectCustomers
            label="Customers"
            name="ownerId"
            multi={false}
            initialValue={ownerId}
            onSelect={handleOwnerId}
          />
        );
      }

      if (ownerType === 'user') {
        return (
          <SelectTeamMembers
            label="Team Members"
            name="ownerId"
            multi={false}
            initialValue={ownerId}
            onSelect={handleOwnerId}
          />
        );
      }

      if (isEnabled('contacts')) {
        return (
          <SelectCompanies
            label="Compnay"
            name="ownerId"
            multi={false}
            initialValue={ownerId}
            onSelect={handleOwnerId}
          />
        );
      }

      return null;
    };

    const btnModal = <Button block={true}>Give Score</Button>;

    const FormColumn = (props: LayoutProps) => (
      <FormGroup>
        <ControlLabel>{props.label}</ControlLabel>
        <div>{props.children}</div>
      </FormGroup>
    );

    const Form = (formProps: IFormProps) => {
      const { values, isSubmitted } = formProps;

      return (
        <>
          <ScrollWrapper>
            <FormColumn label="Owner type">
              <FormControl
                {...formProps}
                name="ownerType"
                componentClass="select"
                defaultValue={ownerType}
                required={true}
                onChange={handleOwnerType}
              >
                {ownerTypeInput.map(p => (
                  <option key={p} value={p}>
                    {' '}
                    {p}{' '}
                  </option>
                ))}
              </FormControl>
            </FormColumn>
            <FormColumn label="Owner">{renderOwner()}</FormColumn>
            <FormColumn label="Score">
              <FormControl
                {...formProps}
                name="discountPercent"
                type="number"
                min={0}
                max={100}
                placeholder="0"
                required={true}
                defaultValue={changeScore}
                onChange={handleScore}
              />
            </FormColumn>
          </ScrollWrapper>
          <ModalFooter>
            <Button btnStyle="simple" icon="cancel-1">
              Close
            </Button>
            {renderBtn({
              name: 'score',
              values: generateDoc(),
              isSubmitted
            })}
          </ModalFooter>
        </>
      );
    };

    const content = () => {
      return <CommonForm renderContent={Form} />;
    };

    return (
      <ModalTrigger
        title="Lottery Detail"
        trigger={btnModal}
        autoOpenKey="showVoucherModal"
        content={content}
        backDrop="static"
      />
    );
  }
}

export default ScoreForm;
