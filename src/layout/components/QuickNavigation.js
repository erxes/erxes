import React from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components"
import { colors, dimensions } from '../../styles';
import { rgba } from '../../utils/color';

const UserHelper = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  float: right;
  background: ${rgba(colors.colorWhite, 0.2)};
`;

const propTypes = {

}

const QuickNavigation = (props) => {
  return (
    <UserHelper>Ganzorig</UserHelper>
  )
}

QuickNavigation.propTypes = propTypes;

export default QuickNavigation
