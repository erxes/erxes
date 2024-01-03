import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger,
  SelectTeamMembers,
  __
} from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';

import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { IFormProps } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import SelectClientPortalUser from '../../../common/SelectClientPortalUsers';
import { getOwnerTypes } from '../../common/constants';

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
      ownerType: 'customer',
      ownerId: '',
      changeScore: 0
    };
  }

  generateDoc = values => {
    const { ownerId } = this.state;

    return {
      ...values,
      changeScore: Number(values?.changeScore || 0),
      ownerId
    };
  };

  renderOwner = () => {
    const { ownerType, ownerId } = this.state;

    const handleOwnerId = id => {
      this.setState(prev => ({ ...prev, ownerId: id }));
    };

    if (isEnabled('contacts') && ownerType === 'customer') {
      return (
        <SelectCustomers
          label="Customer"
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
          label="Team Member"
          name="ownerId"
          multi={false}
          initialValue={ownerId}
          onSelect={handleOwnerId}
        />
      );
    }

    if (isEnabled('contacts') && ownerType === 'company') {
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

    if (isEnabled('clientportal') && ownerType === 'cpUser') {
      return (
        <SelectClientPortalUser
          label="Business Portal User"
          name="ownerId"
          multi={false}
          initialValue={ownerId}
          onSelect={handleOwnerId}
        />
      );
    }

    return null;
  };

  render() {
    const { ownerType, ownerId } = this.state;
    const { renderBtn } = this.props;

    let changeScore = 0;

    const handleOwnerType = e => {
      const target = e.currentTarget as HTMLInputElement;
      const value = target.value;
      const name = target.name;
      this.setState(prev => ({ ...prev, [name]: value }));
    };

    const Form = (formProps: IFormProps, closeModal: () => void) => {
      const { values, isSubmitted } = formProps;

      return (
        <>
          <FormGroup>
            <ControlLabel>{__('Owner type')}</ControlLabel>
            <FormControl
              {...formProps}
              name="ownerType"
              componentClass="select"
              defaultValue={ownerType}
              required={true}
              onChange={handleOwnerType}
            >
              {getOwnerTypes().map(({ label, name }) => (
                <option key={name} value={name}>
                  {label}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Owner')}</ControlLabel>
            {this.renderOwner()}
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Score')}</ControlLabel>
            <FormControl
              {...formProps}
              name="changeScore"
              type="number"
              min={0}
              max={100}
              placeholder="0"
              required={true}
              defaultValue={changeScore}
            />
          </FormGroup>
          <ModalFooter>
            <Button btnStyle="simple" icon="cancel-1" onClick={closeModal}>
              {__('Close')}
            </Button>
            {renderBtn({
              name: 'score',
              values: this.generateDoc(values),
              isSubmitted,
              callback: closeModal
            })}
          </ModalFooter>
        </>
      );
    };

    const content = ({ closeModal }) => {
      return (
        <CommonForm renderContent={formProps => Form(formProps, closeModal)} />
      );
    };

    const trigger = <Button btnStyle="success">{__('Give Score')}</Button>;

    return (
      <ModalTrigger
        title="Lottery Detail"
        trigger={trigger}
        autoOpenKey="showVoucherModal"
        content={content}
        backDrop="static"
      />
    );
  }
}

export default ScoreForm;
