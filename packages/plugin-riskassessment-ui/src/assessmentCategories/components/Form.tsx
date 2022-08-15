import React from 'react';
import { Button, FormControl, FormGroup, Icon, ModalTrigger } from '@erxes/ui/src';
import { CustomFormGroup } from '../../common/utils';
import CreateForm from '@erxes/ui-forms/src/forms/containers/CreateForm';
import { RiskAssessmentCategory } from '../../common/types';
import { PreviewWrapper } from '@erxes/ui/src/components/ImageWithPreview';
import { ShowPreview } from '@erxes/ui-forms/src/forms/styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/';

type IProps = {
  categories?: RiskAssessmentCategory[];
};

type IState = {
  isReadyToSave: boolean;
  doc: object;
};

class Form extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      isReadyToSave: false,
      doc: {},
    };
  }

  formTrigger = (<Button>Build Form</Button>);
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
          <Button btnStyle="simple" type="button" icon="cancel-1">
            Cancel
          </Button>

          <Button btnStyle="success" type="button" icon="cancel-1">
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
    const afterDbSave = (formId: string) => {
      console.log(formId);
    };

    const updatedProps = {
      afterDbSave,
      type: 'growthHack',
      isReadyToSave: this.state.isReadyToSave,
    };

    return <CreateForm {...updatedProps} />;
  };

  form = (<ModalTrigger title="Build New Form" content={this.createForm} trigger={this.formTrigger} />);

  modalTrigger = (<Button>Add New Assessment Category</Button>);

  handleDoc = (e) => {
    const { name, value } = e.target as HTMLInputElement;
    this.setState((prev) => ({ doc: { ...prev.doc, [name]: value } }));
  };

  modal = () => {
    return (
      <>
        <CustomFormGroup label="Name">
          <FormControl name="name" type="text" onChange={this.handleDoc} />
        </CustomFormGroup>
        <CustomFormGroup label="Add Form">{this.form}</CustomFormGroup>
        <CustomFormGroup label="code">
          <FormControl name="code" type="text" onChange={this.handleDoc} />
        </CustomFormGroup>
        <CustomFormGroup label="Parent" spaceBetween>
          <FormControl name="parentId" componentClass="select" onChange={this.handleDoc}>
            <option />
            {this.props.categories?.map((parent) => (
              <option value={parent.name} key={parent.name}>
                {parent.name}
              </option>
            ))}
          </FormControl>
        </CustomFormGroup>
      </>
    );
  };

  render() {
    return <ModalTrigger title="New Assessment Categories" content={this.modal} trigger={this.modalTrigger} />;
  }
}

export default Form;
