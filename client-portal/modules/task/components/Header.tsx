import React from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import TaskForm from "../containers/Form";
import { HeaderWrapper, SearchContainer } from "../../styles/main";
import Icon from "../../common/Icon";

type Props = {};

type State = {
  searchValue: string;
  focused: boolean;
  show: boolean;
};

export default class TaskHeader extends React.Component<Props, State> {
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
              placeholder="Search for tasks..."
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
              <Icon icon="add" /> Submit New Task
            </Button>
          </div>
        </HeaderWrapper>
        <Modal
          content={() => <TaskForm />}
          onClose={this.showModal}
          isOpen={show}
        />
      </>
    );
  }
}
