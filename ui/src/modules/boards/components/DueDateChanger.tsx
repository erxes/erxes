import Datetime from '@nateradebaugh/react-datetime';
import Icon from 'modules/common/components/Icon';
import { rgba } from 'modules/common/styles/color';
import colors from 'modules/common/styles/colors';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const DateWrapper = styledTS<{ color: string; hasValue?: boolean }>(
  styled.div
)`
	position: relative;

	input {
		background-color: ${props => rgba(props.color, 0.1)};
		color: ${props => props.color};
		border: none;
		box-shadow: none;
		outline: 0;
		padding: 0 10px 0 25px;
		height: 25px;
		border-radius: 2px;
		font-weight: 500;
		line-height: 25px;
		width: ${props => (props.hasValue ? '130px' : '100px')};
		font-size: 12px;

		&:hover {
			background: ${props => rgba(props.color, 0.15)};
			cursor: pointer;
		}

		&:focus {
			box-shadow: none;
		}

		::placeholder { 
			color: ${props => props.color};
			font-weight: 500;
			opacity: 1;
		}
	}

	> i {
		color: ${props => props.color};
		line-height: 25px;
		position: absolute;
		left: 7px;
	}

	> button {
		position: absolute;
		right: 2px;
		top: 2px;
		bottom: 2px;
		padding: 0;
		width: 20px;
		border: none;
		color: ${props => props.color};
		border-radius: 2px;
		background-color: ${props => rgba(props.color, 0.15)};

		&:hover {
			background: ${props => rgba(props.color, 0.3)};
			cursor: pointer;
		}
	}
`;

type IProps = {
  onChange: (value?: string | Date | null) => void;
  value: Date;
  isWarned?: boolean;
};

class DueDateChanger extends React.Component<IProps> {
  clearDate = () => this.props.onChange(null);

  hasValue = () => (this.props.value ? true : false);

  render() {
    const { onChange, value, isWarned } = this.props;
    const color = isWarned ? colors.colorCoreRed : colors.colorPrimaryDark;

    return (
      <DateWrapper color={color} hasValue={this.hasValue()}>
        <Icon icon="clock-eight" />
        <Datetime
          inputProps={{ placeholder: 'Due date' }}
          dateFormat="MMM,DD YYYY"
          timeFormat={false}
          value={value}
          closeOnSelect={true}
          onChange={onChange}
          utc={true}
        />
        {this.hasValue() && (
          <button onClick={this.clearDate}>
            <Icon icon="times" />
          </button>
        )}
      </DateWrapper>
    );
  }
}

export default DueDateChanger;
