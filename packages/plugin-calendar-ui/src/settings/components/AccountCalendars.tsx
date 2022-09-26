import { COLORS } from '@erxes/ui/src/constants/colors';
import { ICalendar as IAccountCalendar } from '../../calendar/types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { colors } from '@erxes/ui/src/styles';
import { ColorPick } from '@erxes/ui/src/styles/main';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import styled from 'styled-components';
import { EditAccountCalendarMutationVariables } from '../types';

type Props = {
  calendars: IAccountCalendar[];
  editCalendar: (doc: EditAccountCalendarMutationVariables) => void;
};

type State = {
  calendarNames: object;
};

const ColorPicker = styled.div`
  width: 30px;
  height: 12px;
  border-radius: 2px;
`;

const InputContainer = styled.span`
  display: inline-block;
  width: 500px;
`;

class AccountCalendars extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      calendarNames: {}
    };
  }

  onNameBlur(calendarId, name) {
    const updatedName = this.state.calendarNames[calendarId];

    if (updatedName !== name) {
      this.props.editCalendar({ _id: calendarId, name: updatedName });
    }
  }

  onChangeName(calendarId, e) {
    const { calendarNames } = this.state;
    calendarNames[calendarId] = e.target.value;

    this.setState({ calendarNames });
  }

  renderExtraLinks(calendar: IAccountCalendar) {
    const onColorChange = e => {
      this.props.editCalendar({ _id: calendar._id, color: e.hex });
    };

    const edit = () => {
      this.props.editCalendar({ _id: calendar._id, show: !calendar.show });
    };

    const color = calendar.color || colors.colorPrimaryDark;

    const popoverBottom = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          triangle="hide"
          color={color}
          onChange={onColorChange}
          colors={COLORS}
        />
      </Popover>
    );

    return (
      <>
        <Tip text="Color" placement="top">
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="bottom"
            overlay={popoverBottom}
          >
            <ColorPick>
              <ColorPicker
                style={{
                  backgroundColor: color
                }}
              />
            </ColorPick>
          </OverlayTrigger>
        </Tip>
        <Tip text="View" placement="top">
          <Button
            btnStyle="link"
            onClick={edit}
            icon={calendar.show ? 'eye' : 'eye-slash'}
          />
        </Tip>
      </>
    );
  }

  render() {
    const { calendars } = this.props;
    const { calendarNames } = this.state;

    return calendars.map((calendar, i) => {
      const calendarId = calendar._id;
      const calendarName = calendar.name;

      return (
        <tr key={calendarId}>
          <td>
            &nbsp; &nbsp; &nbsp;{' '}
            <Icon icon={'circle'} style={{ color: calendar.color }} />{' '}
            <InputContainer>
              <FormControl
                value={calendarNames[calendarId] || calendarName}
                required={true}
                onBlur={this.onNameBlur.bind(this, calendarId, calendarName)}
                onChange={this.onChangeName.bind(this, calendarId)}
              />
            </InputContainer>
          </td>
          <td>
            <ActionButtons>{this.renderExtraLinks(calendar)}</ActionButtons>
          </td>
        </tr>
      );
    });
  }
}

export default AccountCalendars;
