import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { renderFullName } from 'modules/common/utils';

const propTypes = {
  items: PropTypes.array,
  uppercase: PropTypes.bool,
  color: PropTypes.string
};

const defaultProps = {
  uppercase: false
};

const Item = styled.li`
  text-transform: ${props => (props.uppercase ? 'uppercase' : 'normal')};
  font-size: ${props => (props.uppercase ? '10px' : '12px')};
  display: flex;
  align-items: center;

  &:first-child:before {
    content: '';
    width: 8px;
    height: 8px;
    float: left;
    margin-right: 5px;
    border-radius: 1px;
    background: ${props =>
      props.color ? `${props.color}` : `${colors.colorShadowGray}`};
  }
`;

class Items extends React.Component {
  renderItem(item, uppercase, color) {
    return (
      <Item uppercase={uppercase} key={item._id} color={color}>
        {item.name || renderFullName(item)}
      </Item>
    );
  }

  renderItems(items) {
    const { uppercase, color } = this.props;
    return items.map(item => this.renderItem(item, uppercase, color));
  }

  render() {
    const { items } = this.props;
    const length = items.length;

    if (length === 0) return null;

    return <Fragment>{this.renderItems(items)}</Fragment>;
  }
}

Items.propTypes = propTypes;
Items.defaultProps = defaultProps;

export default Items;
