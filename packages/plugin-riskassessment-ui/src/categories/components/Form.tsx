import { Button, FormControl, Spinner } from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { RiskAssessmentCategory } from '../../common/types';
import { CustomFormGroup, subOption } from '../../common/utils';

type IProps = {
  categories?: RiskAssessmentCategory[];
  detail?: RiskAssessmentCategory;
  loading: boolean;
  addCategory: (variables: object) => any;
  updateCategory: (variables: object) => any;
  closeModal: () => void;
  trigger?: JSX.Element;
};

type DocField = {
  name?: string;
  code?: string;
  parentId?: string;
};
type IState = {
  isReadyToSave: boolean;
  doc: DocField;
};

class Form extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      isReadyToSave: false,
      doc: {}
    };

    this.handleSaveCategory = this.handleSaveCategory.bind(this);
  }

  modalTrigger = (
    <Button block btnStyle="success">
      Add New Assessment Category
    </Button>
  );

  handleDoc = e => {
    const { name, value } = e.target as HTMLInputElement;
    this.setState(prev => ({ doc: { ...prev.doc, [name]: value } }));
  };

  handleSaveCategory() {
    const { detail, addCategory, updateCategory } = this.props;
    const variables = { ...this.state.doc };
    if (detail) {
      const oldVariables = (({ _id, name, parentId, code }) => ({
        _id,
        name,
        parentId,
        code
      }))(detail);
      return updateCategory({ ...oldVariables, ...variables });
    }
    addCategory(variables);
  }

  render() {
    const { detail, loading } = this.props;

    if (loading) {
      return <Spinner />;
    }

    return (
      <>
        <CustomFormGroup label="Name">
          <FormControl
            name="name"
            type="text"
            defaultValue={detail?.name}
            onChange={this.handleDoc}
          />
        </CustomFormGroup>
        <CustomFormGroup label="code">
          <FormControl
            name="code"
            type="text"
            defaultValue={detail?.code}
            onChange={this.handleDoc}
          />
        </CustomFormGroup>
        <CustomFormGroup label="Type">
          <FormControl
            name="type"
            componentClass="select"
            value={detail?.type}
            onChange={this.handleDoc}
          >
            <option />
            <option value="devation">Devation</option>
            <option value="safeWorkPermit">Safe Work Permit</option>
            <option value="action">Action</option>
          </FormControl>
        </CustomFormGroup>
        <CustomFormGroup label="Parent" spaceBetween>
          <FormControl
            name="parentId"
            componentClass="select"
            value={detail?.parent?._id}
            onChange={this.handleDoc}
          >
            <option />
            {this.props.categories?.map(
              category =>
                category._id !== detail?._id && (
                  <option value={category._id} key={category._id}>
                    {category.parentId && subOption(category)}
                    {category.name}
                  </option>
                )
            )}
          </FormControl>
        </CustomFormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            icon="check-circle"
            uppercase={false}
            onClick={this.handleSaveCategory}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default Form;
