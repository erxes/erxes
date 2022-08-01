import {
  __,
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup,
  MainStyleModalFooter as ModalFooter,
  ModalTrigger
} from '@erxes/ui/src';
import React from 'react';
import Select from 'react-select-plus';

import CategoryForm from '../../containers/carCategory/CategoryForm';
import { Row } from '../../styles';
import { ICarCategory, IOption } from '../../types';
import { generateTree } from '../../utils';

type Props = {
  carCategories: ICarCategory[];
  car: ICarCategory;
  closeModal: () => void;
  saveMatch: (carCategoryIds: any) => void;
};

type State = {
  categoryIds: string[];
};

class MatchCarForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const ids = props.carCategoryIds || [];

    this.state = {
      categoryIds: ids
    };
  }

  renderAddCategory = () => {
    const { carCategories } = this.props;

    const trigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Add Category
      </Button>
    );

    const content = props => (
      <CategoryForm {...props} carCategories={carCategories} />
    );

    return (
      <ModalTrigger
        title="Create category"
        trigger={trigger}
        content={content}
      />
    );
  };

  onChangeCategory = (category: IOption[]) => {
    this.setState({
      categoryIds: category.map(v => v.value)
    });
  };

  saveMatches = () => {
    const { saveMatch } = this.props;

    saveMatch(this.state.categoryIds);
    this.props.closeModal();
  };

  renderContent = () => {
    const { closeModal, carCategories } = this.props;
    const { categoryIds } = this.state;

    return (
      <>
        <FormGroup>
          {__(
            'Please select a type of cargo that can be transported on this machine'
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose Car Category</ControlLabel>
          <Row>
            <Select
              value={categoryIds}
              multi={true}
              onChange={this.onChangeCategory}
              options={generateTree(carCategories, '', (node, level) => ({
                value: node._id,
                label: `${'---'.repeat(level)} ${node.name}`
              }))}
            />
            {this.renderAddCategory()}
          </Row>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          <Button
            btnStyle="success"
            onClick={this.saveMatches}
            icon="times-circle"
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default MatchCarForm;
