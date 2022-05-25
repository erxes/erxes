import React from 'react';
import SelectBoards from '@erxes/ui-settings/src/properties/containers/SelectBoardPipeline';
class Form extends React.Component<any, any> {
  constructor(props) {
    super(props);

    const config = props.config || {};

    this.state = {
      selectedItems: config.boardsPipelines || []
    };
  }

  itemsChange = items => {
    this.setState({ selectedItems: items }, () => {
      const boardsPipelines =
        items &&
        items.map(e => {
          const boardsPipeline = {
            boardId: e.boardId,
            pipelineIds: e.pipelineIds
          };

          return boardsPipeline;
        });

      this.props.onChangeItems(boardsPipelines);
    });
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
