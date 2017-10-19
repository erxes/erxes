import React from 'react';
import styled from "styled-components"
import { colors, dimensions } from '../../styles';
import { rgba } from '../../utils/color';

const UserHelper = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  float: right;
  background: ${rgba(colors.colorWhite, 0.1)};
`;

const propTypes = {

}

const QuickNavigation = () => {
  return (
    <UserHelper>Ganzorig</UserHelper>
  )
}

QuickNavigation.propTypes = propTypes;

export default QuickNavigation
