import React from 'react';
import { Button, FormControl, FormGroup, generateCategoryOptions, Icon, ModalTrigger, Spinner, Tip } from '@erxes/ui/src';
import { CustomFormGroup, subOption } from '../../common/utils';
import CreateForm from '@erxes/ui-forms/src/forms/containers/CreateForm';
import EditForm from '@erxes/ui-forms/src/forms/containers/EditForm';
import { RiskAssessmentCategory } from '../../common/types';
import { PreviewWrapper, FormContainer } from '../../styles';
import { ShowPreview } from '@erxes/ui-forms/src/forms/styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { __ } from '@erxes/ui/src/';

type IProps = {
  categories?: RiskAssessmentCategory[];
  category?: RiskAssessmentCategory;
  loading: boolean;
  addCategory: (variables: object) => any;
  trigger?: JSX.Element;
  formId?: string;
};

type DocField = {
  name?: string;
  code?: string;
  form?: string;
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
      doc: {},
    };

    this.addCategory = this.addCategory.bind(this);
  }

  formTrigger = (
    <Button>
      <Tip placement="top" text="Build a Form">
        <Icon icon="file-plus-alt" />
      </Tip>
    </Button>
  );

  handleSaveForm = () => {
    this.setState({ isReadyToSave: true });
  };

  handleCloseForm = () => {};

  renderFooter = (items: number) => {
    if (items === 0) {
      return null;
    }

    return (
      <>
        <ShowPreview>
          <Icon icon="eye" /> {__('Form preview')}
        </ShowPreview>
        <ModalFooter>
          <Button btnStyle="simple" type="button" icon="cancel-1" onClick={this.handleCloseForm}>
            Cancel
          </Button>

          <Button btnStyle="success" type="button" icon="cancel-1" onClick={this.handleSaveForm}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  formPreview = (previewRenderer, fields) => {
    return (
      <PreviewWrapper>
        {previewRenderer()}
        {this.renderFooter(fields ? fields.length : 0)}
      </PreviewWrapper>
    );
  };

  createForm = () => {
    const { doc, isReadyToSave } = this.state;
    const { formId } = this.props;

    const afterDbSave = (formId: string) => {
      this.setState((prev) => ({ doc: { ...prev.doc, formId }, isReadyToSave: false }));
    };

    const props = {
      renderPreviewWrapper: this.formPreview,
      afterDbSave,
      type: 'growthHack',
      isReadyToSave: isReadyToSave,
      hideOptionalFields: true,
      form: doc?.form ? { title: doc?.form } : {},
    };

    if (formId) {
      return <EditForm {...props} formId={formId} />;
    }

    return <CreateForm {...props} />;
  };

  form = (<ModalTrigger title="Build New Form" size="xl" content={this.createForm} trigger={this.formTrigger} />);

  modalTrigger = (
    <Button block btnStyle="success">
      Add New Assessment Category
    </Button>
  );

  handleDoc = (e) => {
    const { name, value } = e.target as HTMLInputElement;
    this.setState((prev) => ({ doc: { ...prev.doc, [name]: value } }));
  };

  addCategory() {
    const variables = { ...this.state.doc };
    this.props.addCategory(variables);
  }

  render() {
    const { category, loading } = this.props;

    const getParent = (value) => {
      const foundedString = value.match(/[/]/gi);
      let toIndex;
      if (foundedString) {
        for (value of foundedString) {
          const str = parseInt(value);
          if (str) {
            toIndex = foundedString.indexOf(str);
          }
        }
      }
      toIndex > 0 && foundedString.substring(0, toIndex);
    };

    if (loading) {
      return <Spinner />;
    }

    return (
      <>
        <CustomFormGroup label="Name">
          <FormControl name="name" type="text" defaultValue={category?.name} onChange={this.handleDoc} />
        </CustomFormGroup>
        <CustomFormGroup label="Build a form">
          <FormContainer gap>
            <FormControl type="text" name="form" defaultValue={category?.formName} onChange={this.handleDoc} />
            {this.form}
          </FormContainer>
        </CustomFormGroup>
        <CustomFormGroup label="code">
          <FormControl name="code" type="text" defaultValue={category?.code} onChange={this.handleDoc} />
        </CustomFormGroup>
        <CustomFormGroup label="Parent" spaceBetween>
          <FormControl name="parentId" componentClass="select" value={category?.parent?._id} onChange={this.handleDoc}>
            <option />
            {this.props.categories?.map((category) => (
              <option value={category._id} key={category._id}>
                {category.parentId && subOption(category)}
                {category.name}
              </option>
            ))}
          </FormControl>
        </CustomFormGroup>
        <ModalFooter>
          <Button btnStyle="simple" icon="times-circle" uppercase={false}>
            Cancel
          </Button>
          <Button btnStyle="success" icon="check-circle" uppercase={false} onClick={this.addCategory}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default Form;
