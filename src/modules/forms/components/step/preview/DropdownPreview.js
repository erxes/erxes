import React from 'react';
import PropTypes from 'prop-types';
import { keyframes } from 'styled-components';
import CommonPreview from './CommonPreview';
import { DropdownContent, CenterContainer } from '../style';

const propTypes = {
  color: PropTypes.string,
  theme: PropTypes.string
};

const sliderTop = keyframes`
  0% {
    opacity: 0.7;
    height: 0px;
  }
  100% {
    opacity: 1;
    height: auto;
  }
`;

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

const Dropdown = DropdownContent.extend`
  animation: ${sliderTop} 0.5s linear;
  position: relative;
  transition: all 0.2s linear;
  flex: inherit;
  border-bottom-style: solid;
  border-width: 2px;
`;

class DropdownPreview extends CommonPreview {
  render() {
    const { theme, color } = this.props;

    return (
      <Container>
        <Dropdown style={{ borderColor: theme ? theme : color }}>
          {this.renderContent()}
        </Dropdown>
      </Container>
    );
  }
}

DropdownPreview.propTypes = propTypes;

export default DropdownPreview;
