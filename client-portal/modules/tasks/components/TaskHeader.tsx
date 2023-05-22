import Button from "../../common/Button";
import { HeaderWrapper } from "../../styles/main";
import Modal from "../../common/Modal";
import React from "react";
import TaskForm from "../containers/Form";

type Props = {
  taskLabel: string;
};

type State = {
  show: boolean;
};

export default class TaskHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  showModal = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { show } = this.state;

    return (
      <>
        <HeaderWrapper>
          <h4>{this.props.taskLabel}</h4>
          <div className="right">
            <Button
              btnStyle="success"
              uppercase={false}
              onClick={this.showModal}
              icon="add"
            >
              Create a New Task
            </Button>
          </div>
        </HeaderWrapper>
        <Modal
          content={() => <TaskForm closeModal={this.showModal} />}
          onClose={this.showModal}
          isOpen={show}
        />
      </>
    );
  }
}
