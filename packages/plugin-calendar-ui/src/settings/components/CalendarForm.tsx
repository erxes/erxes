import { AppConsumer } from "@erxes/ui/src/appContext";
import { COLORS } from "@erxes/ui/src/constants/colors";
import { Flex } from "@erxes/ui/src/styles/main";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Form from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { colors } from "@erxes/ui/src/styles";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import { ColorPick, ColorPicker } from "@erxes/ui/src/styles/main";
import React from "react";
import Popover from "@erxes/ui/src/components/Popover";
import TwitterPicker from "react-color/lib/Twitter";
import Select from "react-select";
import { ICalendar, IGroup } from "../types";
import Dialog from "@erxes/ui/src/components/Dialog";
import {
  ModalFooter,
} from "@erxes/ui/src/styles/main";

type Props = {
  show: boolean;
  calendar?: ICalendar;
  groups: IGroup[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type FinalProps = {
  currentUserId: string;
} & Props;

type State = {
  backgroundColor: string;
  groupId: string;
  isPrimary: boolean;
};

class CalendarForm extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      backgroundColor: colors.colorPrimaryDark,
      groupId: "",
      isPrimary: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { show, calendar } = nextProps;

    if (show && calendar && calendar._id) {
      this.setState({
        backgroundColor: calendar.color,
        groupId: calendar.groupId,
        isPrimary: calendar.isPrimary || false,
      });
    }
  }

  onChangeIsPrimary = (e) => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isPrimary: isChecked });
  };

  onColorChange = (e) => {
    this.setState({ backgroundColor: e.hex });
  };

  generateDoc = (values: { _id?: string }) => {
    const { calendar } = this.props;
    const { backgroundColor, isPrimary, groupId } = this.state;
    const finalValues = values;

    if (calendar) {
      finalValues._id = calendar._id;
    }

    return {
      ...finalValues,
      groupId,
      isPrimary,
      color: backgroundColor,
    };
  };

  renderOptions = (array) => {
    return array.map((obj) => ({
      value: obj._id,
      label: obj.name,
    }));
  };

  renderGroups() {
    const { groups, calendar } = this.props;

    const onChange = (item) => this.setState({ groupId: item.value });

    return (
      <FormGroup>
        <ControlLabel required={true}>Group</ControlLabel>
        <Select
          placeholder={__("Choose a group")}
          value={this.renderOptions(groups).find(
            (o) =>
              o.value === (this.state.groupId || (calendar && calendar.groupId))
          )}
          options={this.renderOptions(groups)}
          onChange={onChange}
          isClearable={false}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { calendar, renderButton, closeModal, currentUserId } = this.props;
    const { values, isSubmitted } = formProps;
    const calendarName = "calendar";
    const showPrimary =
      !calendar || (calendar && currentUserId === calendar.userId);

    return (
      <div id="manage-calendar-modal">
        <Flex>
          <FormGroup>
            <ControlLabel>Background</ControlLabel>
            <div>
              <Popover
                placement="bottom"
                trigger={
                  <ColorPick>
                    <ColorPicker
                      style={{ backgroundColor: this.state.backgroundColor }}
                    />
                  </ColorPick>
                }
              >
                <TwitterPicker
                  width="266px"
                  triangle="hide"
                  color={this.state.backgroundColor}
                  onChange={this.onColorChange}
                  colors={COLORS}
                />
              </Popover>
            </div>
          </FormGroup>
        </Flex>

        {this.renderGroups()}

        {showPrimary && (
          <FormGroup>
            <ControlLabel>Is primary</ControlLabel>

            <FormControl
              {...formProps}
              name="isPrimary"
              defaultChecked={this.state.isPrimary}
              componentclass="checkbox"
              onChange={this.onChangeIsPrimary}
            />
          </FormGroup>
        )}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: calendarName,
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: calendar,
            confirmationUpdate: true,
          })}
        </ModalFooter>
      </div>
    );
  };

  render() {
    const { calendar, closeModal, show } = this.props;
    const calendarName = "calendar";

    if (!show) {
      return null;
    }

    return (
      <Dialog
        show={show}
        closeModal={closeModal}
        title={calendar ? `Edit ${calendarName}` : `Add ${calendarName}`}
      >
        <Form renderContent={this.renderContent} />
      </Dialog>
    );
  }
}

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => (
      <CalendarForm
        {...props}
        currentUserId={(currentUser && currentUser._id) || ""}
      />
    )}
  </AppConsumer>
);
