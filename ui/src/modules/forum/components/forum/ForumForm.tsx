import React from 'react';
import Form from 'modules/common/components/form/Form';
import Button from 'modules/common/components/Button';
import { ModalFooter } from 'modules/common/styles/main';

import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexContent } from 'modules/layout/styles';

import SelectBrand from 'modules/settings/integrations/containers/SelectBrand';
import { ExpandWrapper } from 'modules/settings/styles';

import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { IForum } from '../../types';

type Props = {
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  forum: IForum;
  remove: (forumId: string) => void;
};

type State = {
  brandId: string;
};

class ForumForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      brandId: ''
    };
  }

  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    brandId: string;
    languageCode: string;
  }) => {
    const { forum } = this.props;
    const finalValues = values;

    if (forum) {
      finalValues._id = forum._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        description: finalValues.description,
        brandId: finalValues.brandId,
        languageCode: finalValues.languageCode
      }
    };
  };

  handleBrandChange = value => {
    this.setState({ brandId: value });
  };

  remove = () => {
    const { remove, forum } = this.props;

    if (remove) {
      remove(forum._id);
    }
  };

  renderFormContent(forum = {} as IForum, formProps: IFormProps) {
    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={forum.title}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={forum.description}
          />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            isRequired={true}
            defaultValue={forum.brandId}
            formProps={formProps}
            onChange={this.handleBrandChange}
          />
        </FormGroup>
        <FlexContent>
          <ExpandWrapper>
            <FormGroup>
              <ControlLabel>Language</ControlLabel>

              <FormControl
                {...formProps}
                componentClass="select"
                defaultValue={forum.languageCode || 'en'}
                name="languageCode"
              >
                <option />
                <option value="mn">Монгол</option>
                <option value="en">English</option>
              </FormControl>
            </FormGroup>
          </ExpandWrapper>
        </FlexContent>
      </React.Fragment>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, forum } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderFormContent(
          forum || {
            title: '',
            description: ''
          },
          { ...formProps }
        )}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>
          {forum && (
            <>
              <Button
                btnStyle="danger"
                type="button"
                onClick={this.remove}
                icon="cancel-1"
              >
                Delete
              </Button>
            </>
          )}

          {renderButton({
            name: 'Forum',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: forum
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ForumForm;
