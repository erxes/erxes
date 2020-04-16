import Icon from 'modules/common/components/Icon';
import { darken, lighten } from 'modules/common/styles/color';
import colors from 'modules/common/styles/colors';
import dimensions from 'modules/common/styles/dimensions';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Modul = styledTS<{ disabled?: boolean }>(styled.div)`
  display: inline-flex;
  background: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  box-shadow: 0 0 15px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  align-items: stretch;
  font-weight: bold;
  width: 100%;
  margin-bottom: 10px;
  margin-right: 20px;

  &:last-child {
    margin-right: 0;
    margin-bottom: 0;
  }

  &:nth-child(3n + 2) {
    margin-right: 0;
  }

  &:hover {
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styledTS<{ color?: string }>(styled.div)`
  padding: 10px 20px;
  color: ${colors.colorWhite};
  background: ${props =>
    `linear-gradient(195deg, ${lighten(
      props.color || colors.colorPrimaryDark,
      40
    )} 0%, ${darken(props.color || colors.colorPrimaryDark, 20)} 100%);;`}
  display: flex;
  align-items: center;
  font-size: 16px;
`;

const Text = styled.div`
  padding: 10px 15px;
  font-weight: normal;
  flex: 1;
  display: flex;
  align-items: center;

  h4 {
    font-size: 14px;
    margin: 0;
    text-transform: capitalize;
  }

  p {
    font-size: 11px;
    margin: 5px 0 0;
  }
`;

type Props = {
  icon?: string;
  color?: string;
  title: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function ModulItem({
  icon = 'chat',
  title,
  description,
  color,
  onClick,
  disabled
}: Props) {
  return (
    <Modul onClick={onClick} disabled={disabled}>
      <IconContainer color={color}>
        <Icon icon={icon} />
      </IconContainer>
      <Text>
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </Text>
    </Modul>
  );
}
