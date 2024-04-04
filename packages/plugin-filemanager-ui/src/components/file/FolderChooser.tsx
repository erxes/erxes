import { IFolder } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils/core';
import styled from 'styled-components';

type Props = {
  folders: IFolder[];
  currentId?: string;
  hasChildIds?: boolean;
  onChangeFolder: (folderId: string, childIds?: string[]) => void;
};

type State = {
  folderId?: string;
  clear?: boolean;
};

export const FolderChooserWrapper = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

class FolderChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      folderId: this.props.currentId || ''
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.currentId) {
      if (this.props.currentId === '') {
        this.setState({ folderId: '' });
      }
    }
  }

  selectOptions(folders: IFolder[]) {
    return folders.map(item => ({
      value: item._id,
      label: item.name,
      order: item.order,
      isRoot: !item.parentId
    }));
  }

  onChange = (folderId: string) => {
    const { folders, hasChildIds } = this.props;

    let childIds: string[] = [];

    if (hasChildIds) {
      const foundFolder = folders.find(c => c._id === folderId);

      if (foundFolder) {
        const childs = folders.filter(c =>
          c.order.startsWith(foundFolder.order)
        );

        if (childs.length) {
          childIds = childIds.concat(childs.map(ch => ch._id));
        }
      }
    }

    this.setState({ folderId });
    this.props.onChangeFolder(folderId, childIds);
  };

  renderOptions = option => {
    const name = option.isRoot ? (
      <strong>{option.label}</strong>
    ) : (
      <>
        <Icon icon="angle-right-b" />
        {option.label}
      </>
    );

    const order = option.order.match(/[/]/gi);
    let space = '';

    if (order) {
      space = '\u00A0 '.repeat(order.length);
    }
    return (
      <div className="simple-option">
        <span>
          {space}
          {name}
        </span>
      </div>
    );
  };

  render() {
    return (
      <FolderChooserWrapper>
        <Select
          isRequired={true}
          placeholder={__('Choose a folder')}
          optionRenderer={this.renderOptions}
          options={this.selectOptions(this.props.folders)}
          value={this.state.folderId}
          onChange={option => this.onChange(option?.value)}
          clearable={false}
        />
      </FolderChooserWrapper>
    );
  }
}

export default FolderChooser;
