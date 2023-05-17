import Button from "../../common/Button";
import DealForm from "../containers/Form";
import { HeaderWrapper } from "../../styles/main";
import Modal from "../../common/Modal";
import React from "react";

type Props = {
  dealLabel: string;
};

type State = {
  show: boolean;
};

export default class DealHeader extends React.Component<Props, State> {
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
          <h4>{this.props.dealLabel}</h4>
          <div className="right">
            <Button
              btnStyle="success"
              uppercase={false}
              onClick={this.showModal}
              icon="add"
            >
              Create a New Deal
            </Button>
          </div>
        </HeaderWrapper>
        <Modal
          content={() => <DealForm closeModal={this.showModal} />}
          onClose={this.showModal}
          isOpen={show}
        />
      </>
    );
  }
}
