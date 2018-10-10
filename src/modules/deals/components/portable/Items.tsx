import { colors } from 'modules/common/styles';
import { renderFullName } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ICompany } from '../../../companies/types';
import { IProduct } from '../../../settings/productService/types';

type Props = {
  items: ICompany[] | IProduct[] | ICustomer[];
  uppercase?: boolean;
  color: string;
};

const Item = styledTS<{ uppercase: boolean }>(styled.li)`
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

class Items extends React.Component<Props> {
  renderItem(item, uppercase, color, index) {
    return (
      <Item uppercase={uppercase} key={index} color={color}>
        {item.name || item.primaryName || renderFullName(item)}
      </Item>
    );
  }

  renderItems(items) {
    const { uppercase, color } = this.props;
    return items.map((item, index) =>
      this.renderItem(item, uppercase, color, index)
    );
  }

  render() {
    const { items } = this.props;
    const length = items.length;

    if (length === 0) return null;

    return <React.Fragment>{this.renderItems(items)}</React.Fragment>;
  }
}

export default Items;
