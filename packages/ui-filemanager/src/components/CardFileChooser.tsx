import { IFile, IFolder } from '../types';

import Box from '@erxes/ui/src/components/Box';
import FileChooser from '../containers/FileChooser';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';

type Props = {
  folderId: string;
  folders: IFolder[];
};

type State = {
  folderId: string;
};

class CardFileChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      folderId: props.folderId || ''
    };
  }

  onChangeFolder = folderId => {
    this.setState({ folderId });
  };

  renderExtraButtons = () => {
    const renderFileChooser = props => {
      return (
        <FileChooser
          {...props}
          folderId={this.state.folderId}
          folders={this.props.folders}
          currentId={this.state.folderId}
          onChangeFolder={this.onChangeFolder}
          item={{} as any}
        />
      );
    };

    return (
      <ModalTrigger
        title="Manage files"
        trigger={
          <button>
            <Icon icon="plus-circle" />
          </button>
        }
        size="xl"
        content={renderFileChooser}
      />
    );
  };

  render() {
    return (
      <Box
        title="File manager"
        isOpen={true}
        name="showFiles"
        extraButtons={this.renderExtraButtons()}
      >
        hi
      </Box>
    );
  }
}

export default CardFileChooser;
