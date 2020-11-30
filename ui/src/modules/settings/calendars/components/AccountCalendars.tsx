import { COLORS } from 'modules/boards/constants';
import { ICalendar as IAccountCalendar } from 'modules/calendar/types';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { colors } from 'modules/common/styles';
import { ColorPick } from 'modules/settings/styles';
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
  showModal: boolean;
};

const ColorPicker = styled.div`
  width: 30px;
  height: 12px;
  border-radius: 2px;
`;

class AccountCalendars extends React.Component<Props, State> {
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

    return calendars.map((calendar, i) => (
      <tr key={calendar._id}>
        <td>
          &nbsp; &nbsp; &nbsp;{' '}
          <Icon icon={'circle'} style={{ color: calendar.color }} />{' '}
          {calendar.name}
        </td>
        <td>
          <ActionButtons>{this.renderExtraLinks(calendar)}</ActionButtons>
        </td>
      </tr>
    ));
  }
}

export default AccountCalendars;
