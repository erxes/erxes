import { Alert, __ } from '@erxes/ui/src/utils';
import { DividerText, StepBody, StepHeader, StepItem } from '../../styles';
import { correctValue, generateModuleParams } from '../../utils';

import Button from '@erxes/ui/src/components/Button';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ICategory } from '../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { PERMISSIONS } from '../../constants';
import React from 'react';
import Select from 'react-select-plus';
import { mutations } from '../../graphql';

type Props = {
  groupId: string;
  refetchQueries: any;
  closeModal: () => void;
  categoryList?: ICategory[];
};

type State = {
  selectedModule: string;
  selectedCategories: any[];
  isSubmitted: boolean;
};

class PermissionForm extends React.Component<Props, State> {
  state = {
    selectedModule: '',
    selectedCategories: [],
    isSubmitted: false
  };

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const { selectedModule, selectedCategories } = this.state;

    if (!selectedModule) {
      return Alert.error('Please select the category!');
    }

    if (!this.hasItems(selectedCategories)) {
      return Alert.error('Please select at least one permission!');
    }

    return this.setState({ isSubmitted: true });
  };

  getVariables = () => {
    const { selectedModule, selectedCategories } = this.state;

    return {
      _id: this.props.groupId,
      permission: selectedModule,
      categoryIds: this.collectValues(selectedCategories)
    };
  };

  hasItems = (items: string[]) => {
    return items.length > 0 ? true : false;
  };

  isModuleSelected = () => {
    if (this.state.selectedModule) {
      return true;
    }

    return false;
  };

  select = <T extends keyof State>(name: T, value) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  changeModule = (item: any) => {
    const selectedModule = correctValue(item);

    this.setState({
      selectedModule,
      selectedCategories: []
    });
  };

  collectValues = (items: any[]) => {
    return items.map(item => item._id);
  };

  renderContent() {
    const { categoryList } = this.props;
    const { selectedModule, selectedCategories } = this.state;

    return (
      <StepItem>
        <StepHeader>{__('What action can do')}</StepHeader>
        <StepBody>
          <FormGroup>
            <ControlLabel required={true}>Choose the permission</ControlLabel>
            <Select
              placeholder={__('Choose permission')}
              options={generateModuleParams(PERMISSIONS)}
              value={selectedModule}
              onChange={this.changeModule}
            />
          </FormGroup>
          <DividerText>{__('Then')}</DividerText>
          <FormGroup>
            <ControlLabel required={true}>Choose the categories</ControlLabel>
            <Select
              placeholder={__('Choose categories')}
              options={generateModuleParams(categoryList)}
              value={selectedCategories}
              disabled={!this.isModuleSelected()}
              onChange={this.select.bind(this, 'selectedCategories')}
              multi={true}
            />
          </FormGroup>
        </StepBody>
      </StepItem>
    );
  }

  render() {
    const { closeModal, refetchQueries } = this.props;

    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <ButtonMutate
            mutation={mutations.addPermit}
            variables={this.getVariables()}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            successMessage={__(`You successfully added a permission`) + '.'}
          />
        </ModalFooter>
      </form>
    );
  }
}

export default PermissionForm;
