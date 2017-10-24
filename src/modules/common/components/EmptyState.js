import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import Button from './Button';
import { colors } from '../styles';

const EmptyStateStyled = styled.div`
  ${props => css`
    display: flex;
    flex-direction: column;
    height: ${props.esSize === 'small' ? '80px' : '100%'};
    min-height: ${props.esSize === 'small' && '80px'};
    justify-content: center;
    text-align: center;
    font-size: ${props.esSize === 'small' ? '12px' : '16px'};
    padding: ${props.esSize === 'small' ? '10px 20px' : '20px'};
    color: ${colors.colorCoreGray};
    background: ${colors.colorWhite};
    position: ${props.esSize === 'full' && 'absolute'};
    bottom: ${props.esSize === 'full' && 0};
    top: ${props.esSize === 'full' && 0};
    left: ${props.esSize === 'full' && 0};
    right: ${props.esSize === 'full' && 0};
    z-index: ${props.esSize === 'full' && 0};
  `};

  > i {
    font-size: ${props => (props.esSize === 'small' ? '28px' : '62px')};
    line-height: ${props => (props.esSize === 'small' ? '40px' : '78px')};
    color: ${colors.colorShadowGray};
  }

  > a {
    margin-top: 10px;
  }
`;

EmptyState.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  esSize: PropTypes.oneOf(['full', 'small']),
  linkUrl: PropTypes.string,
  linkText: PropTypes.string
};

function EmptyState({ text, icon, esSize, linkUrl, linkText }) {
  return (
    <EmptyStateStyled esSize={esSize}>
      {icon}
      {text}
      {linkUrl && linkText ? (
        <Button btnStyle="simple" size="small" href={linkUrl}>
          {linkText}
        </Button>
      ) : null}
    </EmptyStateStyled>
  );
}

EmptyState.defaultProps = {
  esSize: 'small'
};

export default EmptyState;
