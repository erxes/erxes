import CreateForm from '@erxes/ui-forms/src/forms/containers/CreateForm';
import EditForm from '@erxes/ui-forms/src/forms/containers/EditForm';
import { ShowPreview } from '@erxes/ui-forms/src/forms/styles';
import { Button, colors, FormControl, Icon, ModalTrigger, Spinner, confirm } from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { RiskAssessmentCategory } from '../../common/types';
import { CustomFormGroup, subOption } from '../../common/utils';
import {
  ContentWrapper,
  FormContainer,
  PreviewWrapper,
  Box as FormTriggerBtn,
  Typography
} from '../../styles';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import mutations from '../graphql/mutations';

type IProps = {
  categories?: RiskAssessmentCategory[];
  detail?: RiskAssessmentCategory;
  loading: boolean;
  addCategory: (variables: object) => any;
  updateCategory: (variables: object) => any;
  closeModal: () => void;
  trigger?: JSX.Element;
  formId?: string;
};

type DocField = {
  name?: string;
  code?: string;
  formId?: string;
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

  handleCloseForm = () => {
    const { formId } = this.state.doc;
    const { detail } = this.props;

    if (formId && !detail) {
      confirm(`Are you sure you want to close.Your created form won't save`).then(() => {
        client.mutate({
          mutation: gql(mutations.removeUnsavedRiskAssessmentCategoryForm),
          variables: { formId }
        });
        return this.props.closeModal();
      });
    }
    this.props.closeModal();
  };

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
    const { doc } = this.state;

    if (loading) {
      return <Spinner />;
    }
    const formTrigger = (
      <FormTriggerBtn selected={detail || doc.formId ? true : false}>
        <FormContainer row justifyCenter gapBetween={10}>
          <Icon
            size={15}
            icon={detail ? 'file-edit-alt' : 'file-plus-alt'}
            color={colors.colorPrimary}
          />
          <Typography fontSize={13} bold color={colors.colorPrimary}>
            {__(detail ? 'Edit a form' : 'Build a form')}
          </Typography>
        </FormContainer>
      </FormTriggerBtn>
    );
    const renderFormContent = ({ closeModal }) => {
      const { formId } = this.props;

      const formPreview = (previewRenderer, fields: IField[]) => {
        const handleSaveForm = () => {
          this.setState({ isReadyToSave: true });
        };

        const footer = (items: number) => {
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

                <Button btnStyle="success" type="button" icon="cancel-1" onClick={handleSaveForm}>
                  Save
                </Button>
              </ModalFooter>
            </>
          );
        };
        return (
          <PreviewWrapper>
            {previewRenderer()}
            {footer(fields ? fields.length : 0)}
          </PreviewWrapper>
        );
      };
      const afterDbSave = (formId: string) => {
        this.setState(prev => ({
          doc: { ...prev.doc, formId },
          isReadyToSave: false
        }));
        closeModal();
      };

      const formProps = {
        renderPreviewWrapper: formPreview,
        afterDbSave,
        type: 'risk-assessment',
        isReadyToSave: this.state.isReadyToSave,
        hideOptionalFields: true
      };
      if (formId) {
        return (
          <ContentWrapper>
            <EditForm {...formProps} formId={formId} />
          </ContentWrapper>
        );
      }

      return (
        <ContentWrapper>
          <CreateForm {...formProps} />
        </ContentWrapper>
      );
    };

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
        <CustomFormGroup label={detail ? 'Edit a form' : 'Build a form'}>
          <FormContainer>
            <ModalTrigger
              isAnimate
              title="Build New Form"
              enforceFocus={false}
              size="xl"
              content={renderFormContent}
              trigger={formTrigger}
            />
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
            onClick={this.handleCloseForm}
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
