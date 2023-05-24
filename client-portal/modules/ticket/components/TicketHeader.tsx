import Button from "../../common/Button";
import { Dropdown } from "react-bootstrap";
import DropdownToggle from "../../common/DropdownToggle";
import { HeaderWrapper } from "../../styles/main";
import React from "react";

type Props = {
  ticketLabel: string;
  mode: any;
  setMode: any;
  setShowForm: (val: boolean) => void;
};

type State = {
  show: boolean;
  currViewMode: string;
};

export default class TicketHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      currViewMode: "List",
    };
  }

  showModal = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { show } = this.state;
    const { setMode, setShowForm } = this.props;

    type ViewMode = {
      showMode: string;
      setMode: string;
    };

    const viewModes: ViewMode[] = [
      { showMode: "List", setMode: "normal" },
      { showMode: "Stage", setMode: "stage" },
      { showMode: "Label", setMode: "label" },
      { showMode: "Priority", setMode: "priority" },
      { showMode: "Due Date", setMode: "duedate" },
      { showMode: "Assigned User", setMode: "user" },
    ];

    return (
      <>
        <HeaderWrapper>
          <h4>{this.props.ticketLabel}</h4>
          <div className="d-flex">
            <Dropdown>
              <Dropdown.Toggle
                as={DropdownToggle}
                id="dropdown-custom-components"
              >
                <Button btnStyle="simple" uppercase={false} icon="filter">
                  {this.state.currViewMode}
                </Button>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {viewModes.map((viewMode) => (
                  <Dropdown.Item
                    key={viewMode.showMode}
                    className="d-flex align-items-center justify-content-between"
                    eventKey="1"
                    onClick={() => {
                      setMode(viewMode.setMode);
                      this.setState({ currViewMode: viewMode.showMode });
                    }}
                  >
                    {viewMode.showMode}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Button
              btnStyle="success"
              uppercase={false}
              onClick={() => setShowForm(true)}
              icon="add"
            >
              Create a New Ticket
            </Button>
          </div>
        </HeaderWrapper>
      </>
    );
  }
}
