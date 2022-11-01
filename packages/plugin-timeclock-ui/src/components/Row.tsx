import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ITimeclock } from '../types';
import { __ } from '@erxes/ui/src/utils';
import { colors, dimensions } from '@erxes/ui/src/styles';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';

const TimeclockNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs(
  {}
)`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const TimeclockWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${props => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

const Margin = styledTS(styled.div)`
 margin: ${dimensions.unitSpacing}px;
`;

type Props = {
  timeclock: ITimeclock;
  space: number;
  // renderButton: (props: IButtonMutateProps) => JSX.Element;
  // timeclocks: ITimeclock[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Timeclocks({ timeclock, checked }) {
    return (
      <TimeclockNameStyled checked={checked}>
        {timeclock.name}
      </TimeclockNameStyled>
    );
  }

  // removeTimeclock = () => {
  //   remove(timeclock);
  // };

  // toggleCheck = () => {
  //   const { edit, timeclock } = this.props;

  //   edit({ _id: timeclock._id, checked: !timeclock.checked });
  // };

  render() {
    const { timeclock, space } = this.props;
    console.log('row', timeclock);
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    // const content = props => (
    //   <Form {...props} timeclock={timeclock} timeclocks={timeclocks} />
    // );

    const shiftStartTime = new Date(timeclock.shiftStart).toLocaleTimeString();
    const shiftDate = new Date(timeclock.shiftStart).toDateString();
    let shiftEndTime = '-';
    if (timeclock.shiftEnd) {
      shiftEndTime = new Date(timeclock.shiftEnd).toLocaleTimeString();
    }

    return (
      <tr>
        <td>{<NameCard user={timeclock.user} />}</td>
        <td>{shiftDate}</td>
        <td>{shiftStartTime}</td>
        <td>{shiftEndTime}</td>
      </tr>
    );
  }
}

export default Row;
