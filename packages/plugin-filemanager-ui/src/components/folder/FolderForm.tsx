import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IFolder } from '../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  folder?: IFolder;
  filemanagerFolders: IFolder[];
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  parentFolderId?: string;
};

class FolderForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      parentFolderId: props.folder ? props.folder.parentId : ''
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { folder } = this.props;
    const finalValues = values;

    if (folder) {
      finalValues._id = folder._id;
    }

    return {
      ...finalValues,
      parentId: this.state.parentFolderId
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, folder, filemanagerFolders, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const object = folder || ({} as IFolder);
    const self = this;

    const onGroupChange = option => {
      const value = option ? option.value : '';

      this.setState({ parentFolderId: value });
    };

    const options = filemanagerFolders.map(g => ({
      value: g._id,
      label: g.name
    }));

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

        {filemanagerFolders.length !== 0 && (
          <FormGroup>
            <ControlLabel>Parent Folder</ControlLabel>

            <Select
              placeholder={__('Choose parent folder')}
              options={options}
              value={this.state.parentFolderId}
              onChange={opt => onGroupChange(opt)}
            />
          </FormGroup>
        )}

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
