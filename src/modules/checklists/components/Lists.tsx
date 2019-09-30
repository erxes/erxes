import React from 'react';
import {
  EditMutationVariables,
  IChecklist,
  IChecklistItem,
  IChecklistItemDoc,
  IChecklistsState
} from '../types';
import List from './List';

type Props = {
  checklists: IChecklist[];
  edit: (doc: EditMutationVariables, callbak: () => void) => void;
  remove: (checklistId: string) => void;
  addItem: (doc: IChecklistItemDoc, callback: () => void) => void;
  editItem: (doc: IChecklistItem, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
  onSelect: (checklistsState: IChecklistsState) => void;
  checklistsState: IChecklistsState;
};

type State = {
  titleEdit: boolean;
  contentEdit: boolean;
};

class Lists extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      titleEdit: false,
      contentEdit: false
    };
  }

  render() {
    const { checklists } = this.props;
    if (checklists.length === 0) {
      return null;
    }

    return checklists.map(list => (
      <List
        key={list._id}
        list={list}
        edit={this.props.edit}
        remove={this.props.remove}
        addItem={this.props.addItem}
        editItem={this.props.editItem}
        removeItem={this.props.removeItem}
        onSelect={this.props.onSelect}
        checklistsState={this.props.checklistsState}
      />
    ));
  }
}

export default Lists;
