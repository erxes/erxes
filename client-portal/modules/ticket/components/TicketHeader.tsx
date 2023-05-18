import Button from "../../common/Button";
import { HeaderWrapper } from "../../styles/main";
import Icon from "../../common/Icon";
import Modal from "../../common/Modal";
import React from "react";
import TicketForm from "../containers/Form";

type Props = {
  ticketLabel: string;
};

type State = {
  show: boolean;
};

export default class TicketHeader extends React.Component<Props, State> {
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
          <h4>{this.props.ticketLabel}</h4>
          <div className="right">
            <Button
              btnStyle="success"
              uppercase={false}
              onClick={this.showModal}
              icon="add"
            >
              Create a New Ticket
            </Button>
          </div>
        </HeaderWrapper>
        <Modal
          content={() => <TicketForm closeModal={this.showModal} />}
          onClose={this.showModal}
          isOpen={show}
        />
      </>
    );
  }
}
