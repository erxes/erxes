import Form from '@erxes/ui/src/components/form/Form';
import Icon from '@erxes/ui/src/components/Icon';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import dayjs from 'dayjs';
import { ITimeclock } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { darken, lighten } from '@erxes/ui/src/styles/ecolor';

type Props = {
  clockType: string;
  startTime?: Date;
  currentUserId: string;
  startClockTime: (startTime: Date, currentUserId: string) => void;
  stopClockTime: (
    stopTime: Date,
    currentUserId: string,
    timeId: string
  ) => void;
  // renderTime: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  timeclock: ITimeclock;
  timeclocks: ITimeclock[];
} & ICommonFormProps;

type State = {
  currentTime: Date;
};

type IItem = {
  order?: string;
  name: string;
  _id: string;
};
const sizes = {
  large: {
    padding: '10px 30px',
    fontSize: '13px'
  },
  medium: {
    padding: '7px 20px',
    fontSize: '12px'
  },
  small: {
    padding: '5px 15px',
    fontSize: '10px'
  }
};

const RoundButtonStyled = styledTS<{
  hugeness: string;
  btnStyle: string;
  block?: boolean;
  uppercase?: boolean;
}>(styled.button)`
  border-radius: 60%;
  position: relative;
  transition: all 0.3s ease;
  outline: 0;

  ${props => css`
    padding: 30px;
    background: #673fbd;
    font-size: ${props.uppercase
      ? sizes[props.hugeness].fontSize
      : `calc(${sizes[props.hugeness].fontSize} + 1px)`};
    text-transform: ${props.uppercase ? 'uppercase' : 'none'};
    color: #fff !important;
    border: none;
    justify-content: center;
    align-items: center;
    font-weight: ${!props.uppercase && '500'};
    margin: 20px;
    &:hover {
      cursor: pointer;
      text-decoration: none;
      color: #fff && ${darken('#fff', 35)};
      background: ${props.btnStyle !== 'link' && `${darken('#673fbd', 20)}`};
    }

    &:active,
    &:focus {
      box-shadow: ${darken('#6569DF', 20)
        ? `0 0 0 0.2rem ${lighten(darken('#6569DF', 20), 65)}`
        : `0 0 0 0.2rem #673FBD`};
      box-shadow: ${props.btnStyle === 'link' && 'none'};
    }

    &:disabled {
      cursor: not-allowed !important;
      opacity: 0.75;
    }
  `};

  & + button,
  + a,
  + span {
    margin-left: 10px;
  }

  > i + span,
  > span + i,
  > span i {
    margin-left: 5px;
  }
`;

const FormComponent = ({
  startClockTime,
  stopClockTime,
  currentUserId,
  timeclocks
}: Props & ICommonFormProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

  const startClock = () => {
    startClockTime(new Date(), currentUserId);
  };

  const stopClock = () => {
    console.log('jsjjsj', timeclocks);
    const last_punch_idx = timeclocks.length - 1;
    const timeId = timeclocks[last_punch_idx]._id;
    stopClockTime(new Date(), currentUserId, timeId);
  };

  const generateTagOptions = (types: IItem[]) => {
    const result: React.ReactNode[] = [];

    for (const type of types) {
      result.push(
        <option key={type._id} value={type._id}>
          {type.name}
        </option>
      );
    }

    return result;
  };

  const renderContent = (formProps: IFormProps) => {
    const shiftStarted =
      localStorage.getItem('shiftStarted') === 'true' || false;
    const { values, isSubmitted } = formProps;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'block', fontSize: '26px', fontWeight: 500 }}>
          {currentTime.toLocaleTimeString()}
        </div>
        <RoundButtonStyled
          hugeness="medium"
          btnStyle="simple"
          onClick={shiftStarted ? stopClock : startClock}
        >
          <Icon icon="clock" style={{ display: 'block' }} />
          {shiftStarted ? 'Clock out' : 'Clock in'}
        </RoundButtonStyled>
      </div>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default FormComponent;
