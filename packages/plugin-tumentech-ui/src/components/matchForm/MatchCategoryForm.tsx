import CommonForm from '@erxes/ui/src/components/form/Form';
import { __ } from '@erxes/ui/src/utils/core';
import Button from '@erxes/ui/src/components/Button';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import Select from 'react-select-plus';

import { Row } from '../../styles';
import { IOption, IProductCategory } from '../../types';
import { generateTree } from '../../utils';

type Props = {
  productCategory: IProductCategory;
  productCategories: IProductCategory[];
  closeModal: () => void;
  saveMatch: (productCategoryIds: string[]) => void;
};

type State = {
  categoryIds: string[];
};

class ProductForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const ids = props.productCategoryIds || [];

    this.state = {
      categoryIds: ids
    };
  }

  onChangeCategory = (category: IOption[]) => {
    this.setState({ categoryIds: category.map(v => v.value) });
  };

  saveMatches = () => {
    const { saveMatch } = this.props;

    saveMatch(this.state.categoryIds);
    this.props.closeModal();
  };

  renderContent = () => {
    const { closeModal, productCategories } = this.props;
    const { categoryIds } = this.state;

    const categories = productCategories.map(c => {
      if (c.parentId === null) {
        return { ...c, parentId: '' };
      }

      return c;
    });

    return (
      <>
        <FormGroup>
          {__(
            'Please select a type of cargo that can be transported on this machine'
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose Product Category</ControlLabel>
          <Row>
            <Select
              value={categoryIds}
              multi={true}
              onChange={this.onChangeCategory}
              options={generateTree(categories, '', (node, level) => ({
                value: node._id,
                label: `${'---'.repeat(level)} ${node.name}`
              }))}
            />
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

export default ProductForm;
