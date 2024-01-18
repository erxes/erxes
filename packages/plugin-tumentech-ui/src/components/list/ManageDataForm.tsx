import { ScrollWrapper } from '@erxes/ui/src/styles/main';
import Form from '@erxes/ui/src/components/form/Form';
import { __ } from '@erxes/ui/src/utils/core';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';

import Dropdown from 'react-bootstrap/Dropdown';

import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IUser } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { FormGroup, FormControl } from '@erxes/ui/src/components/form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Select from 'react-select-plus';

import { ICar, ICarCategory, ICarDoc, MainQueryResponse } from '../../types';
import ProgressBar from '@erxes/ui/src/components/ProgressBar';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  closeModal: () => void;
  carsQuery: MainQueryResponse;
  successCount: number;
  loopCount: number;
  loadManageMethod: () => void;
};

type State = {
  users?: IUser[];
  carCategoryId: string;
};

class ManageDataForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { car = {}, carCategories } = props;
  }

  renderContent = (formProps: IFormProps) => {
    const { closeModal, carsQuery, loadManageMethod, loopCount } = this.props;
    const { values, isSubmitted } = formProps;
    const percententage = (100 * loopCount) / carsQuery.carsMain.totalCount;
    const MIGRATE_TYPES = [
      { label: 'Car', value: 'car' },
      { label: 'Contacts', value: 'contact' }
    ];
    return (
      <>
        {/* <FormGroup>
          <ControlLabel>Property type</ControlLabel>

          <Select
            isRequired={true}
            value={''}
            options={MIGRATE_TYPES.map(p => ({
              label: p.label,
              value: p.value
            }))}
            onChange={() => {}}
            placeholder={__('Choose type')}
          />
        </FormGroup> */}
        <span>{percententage?.toFixed(0)}%</span>
        <ProgressBar percentage={percententage} height="10px" color={'red'} />

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          <Button
            btnStyle="success"
            onClick={() => {
              loadManageMethod();
            }}
            icon="cancel-1"
          >
            Apply
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ManageDataForm;
