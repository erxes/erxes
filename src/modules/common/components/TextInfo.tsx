import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';

const types = {
  default: {
    color: colors.colorSecondary
  },
  primary: {
    color: colors.colorPrimary
  },
  success: {
    color: colors.colorCoreGreen
  },
  danger: {
    color: colors.colorCoreRed
  },
  warning: {
    color: colors.colorCoreYellow
  },
  simple: {
    color: colors.colorCoreLightGray
  }
};

const Text = styledTS<{ textStyle: string; hugeness: string }>(styled.span)`
  text-transform: uppercase;
  font-size: ${props => (props.hugeness !== 'small' ? '14px' : '10px')};
  font-weight: bold;
  color: ${props => types[props.textStyle].color}
`;

type Props = {
  children: React.ReactNode | string;
  ignoreTrans?: boolean;
  textStyle?: string;
  hugeness?: string;
};

const defaultProps = {
  textStyle: 'default',
  hugeness: 'small'
};

class TextInfo extends React.PureComponent<Props> {
  render() {
    const { ignoreTrans, children } = this.props;

    let content;

    if (ignoreTrans) {
      content = children;
    } else if (typeof children === 'string') {
      content = __(children);
    }

    return (
      <Text {...defaultProps} {...this.props}>
        {content}
      </Text>
    );
  }
}

export default TextInfo;
