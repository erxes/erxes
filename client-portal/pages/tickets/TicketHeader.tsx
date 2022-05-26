import React from "react";
import {
  SearchContainer,
  HeaderWrapper,
} from "../../modules/styles/main";
import Icon from "../../modules/common/Icon";
import Modal from "../../modules/common/Modal";
import Button from "../../modules/common/Button";
import TicketForm from "../../modules/ticket/containers/Form";

type Props = {};

type State = {
  searchValue: string;
  focused: boolean;
  show: boolean;
};

export default class TicketHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { searchValue } = props;

    this.state = {
      searchValue: searchValue || "",
      focused: false,
      show: false,
    };
  }

  componentWillReceiveProps(props) {
    const { searchValue } = props;

    this.setState({
      searchValue: searchValue || "",
    });
  }

  onChange = (e) => {
    const value = e.target.value;

    this.setState({
      searchValue: value,
    });
  };

  onSearch = () => {
    return;
  };

  onKeyDown = (e) => {
    return;
  };

  clearSearch = () => {
    this.setState({ searchValue: "" });
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  onBlur = () => {
    this.setState({ focused: false });
  };

  showModal = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { searchValue, focused, show } = this.state;

    return (
      <>
        <HeaderWrapper>
          {/* <SearchContainer focused={focused}>
            <Icon icon="search-1" onClick={this.onSearch} />

            {searchValue && (
              <Icon icon="times-circle" onClick={this.clearSearch} />
            )}

            <input
              onChange={this.onChange}
              placeholder="Search for tickets..."
              value={searchValue}
              onKeyDown={this.onKeyDown}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
            />
          </SearchContainer> */}
          <div className="right">
            <Button
              btnStyle="primary"
              uppercase={false}
              onClick={this.showModal}
            >
              <Icon icon="add" /> Submit New Ticket
            </Button>
          </div>
        </HeaderWrapper>
        <Modal
          content={() => <TicketForm />}
          onClose={this.showModal}
          isOpen={show}
        />
      </>
    );
  }
}
