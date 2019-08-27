import React from 'react';
import AddForm from '../../components/portable/AddForm';
import { IItem, IItemParams, IOptions, SaveMutation } from '../../types';

type IProps = {
  options: IOptions;
  mainType: string;
  mainTypeId: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  showSelect?: boolean;
  closeModal: () => void;
  callback?: () => void;
  saveItem: (doc: IItemParams, callback: (item: IItem) => void) => void;
};

type FinalProps = {
  addMutation: SaveMutation;
} & IProps;

export default class AddFormContainer extends React.Component<FinalProps> {
  render() {
    const extendedProps = {
      ...this.props,
      saveItem: this.props.saveItem,
      showSelect: true,
      options: this.props.options
    };

    return <AddForm {...extendedProps} />;
  }
}
