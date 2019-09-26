import React from 'react';
import { EditMutationVariables, IChecklist, IChecklistItemDoc } from '../types';
import List from './List';

type Props = {
  checklists: IChecklist[];
  edit: (doc: EditMutationVariables, callbak: () => void) => void;
  remove: (checklistId: string) => void;
  addItem: (doc: IChecklistItemDoc, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
};

type State = {
  titleEdit: boolean;
  contentEdit: boolean;
};

class Checklists extends React.Component<Props, State> {
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
        removeItem={this.props.removeItem}
      />
    ));
  }
}

export default Checklists;
