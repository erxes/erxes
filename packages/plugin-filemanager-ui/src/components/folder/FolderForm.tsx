import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IFolder } from '../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  folder?: IFolder;
  root?: boolean;
  queryParams: any;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class FolderForm extends React.Component<Props> {
  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { folder, queryParams, root } = this.props;
    const finalValues = values;

    if (folder) {
      finalValues._id = folder._id;
    }

    return {
      ...finalValues,
      parentId: folder
        ? folder.parentId
        : !root && queryParams._id
        ? queryParams._id
        : ''
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, folder, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const object = folder || ({} as IFolder);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            autoFocus={true}
            defaultValue={object.name}
            required={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'folder',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: folder
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default FolderForm;
