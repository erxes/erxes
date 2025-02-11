import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  SelectWithSearch,
  __,
} from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';

import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { IFormProps } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import SelectClientPortalUser from '../../../common/SelectClientPortalUsers';
import { getOwnerTypes } from '../../common/constants';

type Props = {
  renderButton: (props: any) => JSX.Element;
  closeModal: () => void;
};

type State = {
  ownerType: string;
  ownerId: string;
  changeScore: number;
  campaignId?: string;
};

const campaignQuery = `
  query ScoreCampaigns {
    scoreCampaigns {
      _id,title
    }
  }
`;

const ScoreForm = ({ renderButton, closeModal }: Props) => {
  const [{ ownerId, ownerType, changeScore, campaignId }, setState] = useState({
    ownerType: 'customer',
    ownerId: '',
    changeScore: 0,
    campaignId: '',
  } as State);

  const handleOwnerType = (e) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const renderOwner = () => {
    const handleOwnerId = (id) => {
      setState((prev) => ({ ...prev, ownerId: id }));
    };

    if (ownerType === 'customer') {
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

    if (ownerType === 'company') {
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
          label="Client Portal User"
          name="ownerId"
          multi={false}
          initialValue={ownerId}
          onSelect={handleOwnerId}
        />
      );
    }

    return null;
  };

  const generateDoc = (values) => {
    return {
      ...values,
      changeScore: Number(values?.changeScore || 0),
      ownerId,
      campaignId: campaignId || undefined,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required>{__('Owner type')}</ControlLabel>
          <FormControl
            {...formProps}
            name="ownerType"
            componentclass="select"
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
          <ControlLabel required>{__('Owner')}</ControlLabel>
          {renderOwner()}
        </FormGroup>
        <FormGroup>
          <ControlLabel>{`${__('Score campaign')} (optional)`}</ControlLabel>
          <SelectWithSearch
            label={'Score Campaigns'}
            queryName="scoreCampaigns"
            name={'campaignId'}
            initialValue={campaignId}
            generateOptions={(list) =>
              list.map(({ _id, title }) => ({
                value: _id,
                label: title,
              }))
            }
            onSelect={(value, name) =>
              setState((prevState) => ({ ...prevState, [name]: value }))
            }
            customQuery={campaignQuery}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Score')}</ControlLabel>
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
          {renderButton({
            name: 'score',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default ScoreForm;
