import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from './Button';
import Icon from './Icon';
import { colors } from '../styles';

const EmptyStateStyled = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  padding: 20px;
  color: ${colors.colorCoreGray};

  img {
    max-height: 260px;
  }

  ${props => {
    if (props.size === 'small') {
      return `
        min-height: 80px;
        font-size: 12px;
        padding: 10px 20px;
      `;
    } else {
      return `
        bottom: 0;
        top: 0;
        left: 0;
        right: 0;
        z-index: 0;
      `;
    }
  }};

  i {
    font-size: ${props => (props.size === 'small' ? '28px' : '14vh')};
    line-height: ${props => (props.size === 'small' ? '40px' : '18vh')};
    color: ${colors.colorCoreLightGray};
  }

  a {
    margin-top: 10px;
    align-self: center;
  }
`;

EmptyState.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  image: PropTypes.string,
  size: PropTypes.oneOf(['full', 'small']),
  linkUrl: PropTypes.string,
  linkText: PropTypes.string
};

EmptyState.contextTypes = {
  __: PropTypes.func
};

function EmptyState({ text, icon, image, size, linkUrl, linkText }, { __ }) {
  return (
    <EmptyStateStyled size={size}>
      {icon ? <Icon icon={icon} /> : <img src={image} alt={text} />}
      {__(text)}
      {linkUrl && linkText ? (
        <Button btnStyle="simple" size="small" href={linkUrl}>
          {linkText}
        </Button>
      ) : null}
    </EmptyStateStyled>
  );
}

EmptyState.defaultProps = {
  size: 'small'
};

export default EmptyState;
