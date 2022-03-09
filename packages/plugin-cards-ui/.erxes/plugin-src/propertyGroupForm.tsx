import React from 'react';
import SelectBoards from '@erxes/ui-settings/src/properties/containers/SelectBoardPipeline';
import { IBoardSelectItem } from '@erxes/ui-settings/src/properties/types';

class Form extends React.Component<any, any> {
  constructor(props) {
    super(props);

    let selectedItems = [];

    if (props.group) {
      selectedItems = props.group.boardsPipelines || [];
    }

    this.state = {
      selectedItems
    };
  }

  onClick = () => {
    this.props.onChangeConfig('changed');
  }

  itemsChange = (items: IBoardSelectItem[]) => {
    this.setState({ selectedItems: items });
  };

  render() {
    return (
      <SelectBoards
        isRequired={false}
        onChangeItems={this.itemsChange}
        type={this.props.type.replace('cards:', '')}
        selectedItems={this.state.selectedItems}
      />
    );
  }
}

export default Form;