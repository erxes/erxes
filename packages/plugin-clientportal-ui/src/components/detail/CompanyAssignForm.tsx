import { ControlLabel, Form } from '@erxes/ui/src/components/form';
import { IFormProps } from '@erxes/ui/src/types';
import { IClientPortalUser } from '../../types';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FlexCenter, ModalFooter } from '@erxes/ui/src/styles/main';
import { Alert } from '@erxes/ui/src/utils';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { __ } from '@erxes/ui/src/utils';
type Props = {
  clientPortalUser: IClientPortalUser;
  assignCompany: (userId: string, erxesCompanyId: string) => void;
  queryParams: any;
};

const CompanyAssignForm = (props: Props) => {
  const { clientPortalUser, assignCompany, queryParams } = props;

  const [companyId, setCompanyId] = useState(null);

  const onSave = () => {
    if (!companyId) {
      Alert.error('Please choose a company to assign');
      return;
    }
    assignCompany(clientPortalUser._id, companyId);
  };

  const onSelect = el => {
    console.log('asdasd ', el);

    setCompanyId(el.value);
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel>
            {(clientPortalUser && clientPortalUser.companyName) || ''}
          </ControlLabel>
          <SelectCompanies
            label={__('Select a company to assign')}
            name="companyIds"
            queryParams={queryParams}
            onSelect={onSelect}
            multi={false}
          />
        </FormGroup>
        <ModalFooter>
          <Button btnStyle="success" type="button" onClick={onSave}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CompanyAssignForm;
