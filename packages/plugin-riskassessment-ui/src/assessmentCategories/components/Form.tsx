import CreateForm from '@erxes/ui-forms/src/forms/containers/CreateForm';
import EditForm from '@erxes/ui-forms/src/forms/containers/EditForm';
import { ShowPreview } from '@erxes/ui-forms/src/forms/styles';
import {
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Spinner,
  Tip
} from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { RiskAssessmentCategory } from '../../common/types';
import { CustomFormGroup, subOption } from '../../common/utils';
import { ContentWrapper, FormContainer, PreviewWrapper } from '../../styles';

type IProps = {
  categories?: RiskAssessmentCategory[];
  detail?: RiskAssessmentCategory;
  loading: boolean;
  addCategory: (variables: object) => any;
  updateCategory: (variables: object) => any;
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
      doc: {}
    };

    this.handleSaveCategory = this.handleSaveCategory.bind(this);
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
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={this.handleCloseForm}
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            type="button"
            icon="cancel-1"
            onClick={this.handleSaveForm}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  formPreview = (previewRenderer, fields: IField[]) => {
    return (
      <PreviewWrapper>
        {previewRenderer()}
        {this.renderFooter(fields ? fields.length : 0)}
      </PreviewWrapper>
    );
  };

  renderFormContent = () => {
    const { doc, isReadyToSave } = this.state;
    const { formId } = this.props;

    const afterDbSave = (formId: string) => {
      this.setState(prev => ({
        doc: { ...prev.doc, formId },
        isReadyToSave: false
      }));
    };

    const formProps = {
      renderPreviewWrapper: this.formPreview,
      afterDbSave,
      type: 'risk-assessment',
      isReadyToSave: isReadyToSave,
      hideOptionalFields: false
    };

    if (formId) {
      return <EditForm {...formProps} formId={formId} />;
    }

    return <CreateForm {...formProps} />;
  };

  renderContent = () => {
    return <ContentWrapper>{this.renderFormContent()}</ContentWrapper>;
  };

  form = (
    <ModalTrigger
      isAnimate
      title="Build New Form"
      enforceFocus={false}
      size="xl"
      content={this.renderContent}
      trigger={this.formTrigger}
    />
  );

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
      const oldVariables = (({ _id, name, formId, parentId, code }) => ({
        _id,
        name,
        formId,
        parentId,
        code
      }))(detail);
      return updateCategory({ ...oldVariables, ...variables });
    }
    addCategory(variables);
  }

  render() {
    const { detail, loading } = this.props;

    const getParent = value => {
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
          <FormControl
            name="name"
            type="text"
            defaultValue={detail?.name}
            onChange={this.handleDoc}
          />
        </CustomFormGroup>
        <CustomFormGroup label="Build a form">
          <FormContainer gap>
            <FormControl
              type="text"
              name="form"
              defaultValue={detail?.formName}
              onChange={this.handleDoc}
            />
            {this.form}
          </FormContainer>
        </CustomFormGroup>
        <CustomFormGroup label="code">
          <FormControl
            name="code"
            type="text"
            defaultValue={detail?.code}
            onChange={this.handleDoc}
          />
        </CustomFormGroup>
        <CustomFormGroup label="Parent" spaceBetween>
          <FormControl
            name="parentId"
            componentClass="select"
            value={detail?.parent?._id}
            onChange={this.handleDoc}
          >
            <option />
            {this.props.categories?.map(category => (
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
