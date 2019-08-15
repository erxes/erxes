import Button from 'modules/common/components/Button';
import React from 'react';
import Templates from '../containers/Templates';

type Props = {
  boardId: string;
  pipelinesRefetch: ({ boardId }: { boardId?: string }) => Promise<any>;
};

type State = {
  showModal: boolean;
};

class TemplateButton extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  renderTemplates() {
    const { boardId, pipelinesRefetch } = this.props;
    const closeModal = () => this.setState({ showModal: false });

    return (
      <Templates
        pipelinesRefetch={pipelinesRefetch}
        boardId={boardId}
        show={this.state.showModal}
        closeModal={closeModal}
      />
    );
  }

  showTemplates = () => {
    this.setState({
      showModal: true
    });
  };

  render() {
    return (
      <>
        <Button
          btnStyle="success"
          size="small"
          icon="add"
          onClick={this.showTemplates}
        >
          From template
        </Button>
        {this.renderTemplates()}
      </>
    );
  }
}

export default TemplateButton;
