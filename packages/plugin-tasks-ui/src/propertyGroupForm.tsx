import React from "react";
import SelectBoards from "@erxes/ui-forms/src/settings/properties/containers/SelectBoardPipeline";
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

      const pipelineNames: Record<string, string> = {};
      (items || []).forEach((e: any) => {
        if (e.pipelineNames) {
          Object.assign(pipelineNames, e.pipelineNames);
        }
      });

      this.props.onChangeItems(boardsPipelines);
      this.props.onChangeItems(pipelineNames, "pipelineNames");
    });
  };

  render() {
    return (
      <SelectBoards
        isRequired={false}
        onChangeItems={this.itemsChange}
        type={this.props.type.replace("tasks:", "")}
        selectedItems={this.state.selectedItems}
      />
    );
  }
}

export default Form;
