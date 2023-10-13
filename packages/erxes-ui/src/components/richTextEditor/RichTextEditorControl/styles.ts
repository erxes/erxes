import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../../../styles';
import { rgba } from '../../../styles/ecolor';

const EditorControl = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 0.0625rem solid #ced4da;
  color: ${colors.textPrimary};
  cursor: pointer;
  height: 1.75rem;
  padding: 0.25rem;
  width: 1.75rem;

  &:hover,
  &.is-active {
    background-color: #f8f9fa;
  }

  &[data-rich-text-editor-control] {
    border-radius: 0;
    &:not(:last-of-type) {
      border-right: 0;
    }
    &:first-of-type {
      border-bottom-left-radius: 0.25rem;
      border-top-left-radius: 0.25rem;
    }
    &:last-of-type {
      margin-right: 0;
      border-bottom-right-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
    }
  }
  &[data-active='true'] {
    color: ${colors.colorSecondary};
    background-color: ${rgba(colors.colorSecondary, 0.15)};
  }
`;

export { EditorControl };
