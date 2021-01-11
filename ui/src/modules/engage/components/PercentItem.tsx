import Icon from 'modules/common/components/Icon';
import { rgba } from 'modules/common/styles/color';
import colors from 'modules/common/styles/colors';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import s from 'underscore.string';

const Item = styledTS<{ color: string }>(styled.div)`
  margin: 10px 10px 0 0;
  background: ${colors.colorWhite};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 6px 10px 1px rgba(136,136,136,0.08);
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${colors.colorCoreGray};
  font-weight: 500;
  font-size: 12px;

  > i {
    background: ${props => rgba(props.color, 0.13)};
    color: ${props => props.color};
    padding: 10px;
    border-radius: 6px;
    line-height: 12px;
    margin-right: 10px;
    font-size: 18px;
  }
`;

const Number = styled.div`
  font-weight: bold;
  font-size: 18px;
  color: ${colors.textPrimary};
  line-height: 22px;

  span {
    font-size: 60%;
    color: ${colors.colorCoreGray};
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -10px -10px 0 0;
`;

type Props = {
  name: string;
  percent: number;
  color: string;
  icon: string;
};

export default function PercentItem({ name, percent, icon, color }: Props) {
  if (typeof percent !== 'number') {
    return null;
  }

  return (
    <Item color={color}>
      <Icon icon={icon} />
      <div>
        <span>{name}</span>
        <Number>
          {s.numberFormat(percent, 2)}
          <span>%</span>
        </Number>
      </div>
    </Item>
  );
}
