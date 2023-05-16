import Button from "../../common/Button";
import { HeaderWrapper } from "../../styles/main";
import { IUser } from "../../types";
import Icon from "../../common/Icon";
import Modal from "../../common/Modal";
import React from "react";
import TaskForm from "../containers/Form";

type Props = {
  currentUser: IUser;
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
    return (
      <>
        <HeaderWrapper>
          <div className="right">
            <Button
              btnStyle="primary"
              uppercase={false}
              onClick={this.showModal}
            >
              <Icon icon="add" /> Submit New Task
            </Button>
          </div>
        </HeaderWrapper>
        <Modal
          content={() => <TaskForm />}
          onClose={this.showModal}
          isOpen={this.state.show}
        />
      </>
    );
  }
}
