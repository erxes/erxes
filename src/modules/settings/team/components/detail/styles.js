import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const Channel = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  width: 100%;

  &:first-of-type {
    border-top: none;
  }

  span {
    display: inline-block;
    color: ${colors.colorCoreLightGray};

    &:last-child {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  i {
    color: ${colors.colorCoreLightGray};
    position: absolute;
    right: ${dimensions.coreSpacing}px;

    &:hover {
      cursor: pointer;
    }
  }
`;

export { Channel };
