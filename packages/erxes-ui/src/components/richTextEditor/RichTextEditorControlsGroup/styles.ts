import styled from 'styled-components';
import { colors } from '../../../styles';
import { rgba } from '../../../styles/ecolor';
// color: ${colors.colorSecondary};
//     background-color: ${rgba(colors.colorSecondary, 0.05)};

const ControlsGroupWrapper = styled.div<{
  $isActive?: boolean;
  $toolbarPlacement?: 'top' | 'bottom';
}>`
  display: flex;

  .Select {
    border: 0.0625rem solid #eee;
    border-radius: 0.25rem;
    height: 1.75rem;
  }
  .Select-clear-zone {
    display: none;
  }
  .Select-input {
    z-index: 10;
    position: absolute;
  }
  .Select.is-disabled > .Select-control {
    background-color: unset !important;
  }
  .Select-control {
    width: 2.75rem;
    border-bottom: none;
  }
  .Select-arrow-zone {
    top: -3px;
  }
  .Select--single > .Select-control .Select-value {
    padding: 0;
    button {
      border: none;
      height: 1.6125rem;
    }
  }

  .Select-input > input {
    color: transparent;
    text-shadow: 0 0 0 #2196f3;
    padding: 12px 0;
    &:focus {
      outline: none;
      cursor: default;
    }
  }

  .Select-menu-outer {
    z-index: 100;
    width: max-content;
    button {
      &[data-rich-text-editor-control='true'] {
        border: none;
        pointer-events: none;
        background: transparent;
      }
    }
  }
  .Select-option {
    padding: 4px 8px;
  }

  .Select-placeholder {
    button {
      border: none;
      height: 1.6125rem;
    }
  }

  .dropdown-toggle {
    display: flex;
    align-items: center;
    height: 1.75rem;
    background: ${({ $isActive }) =>
      $isActive ? rgba(colors.colorSecondary, 0.05) : 'transparent'};
    border: 0.0625rem solid #eee;
    border-radius: 0.25rem;

    button {
      border: none;
      height: 100%;
      width: 100%;
      pointer-events: none;
      color: ${({ $isActive }) =>
        $isActive ? colors.colorSecondary : colors.textPrimary};
      background: transparent;
    }
  }

  .dropdown-menu {
    padding: 0;
  }

  .dropdown-item {
    padding: 0;
    &:active {
      background-color: unset;
    }
    button[data-rich-text-editor-control] {
      width: 100%;
      border: none;
      border-radius: 0;
    }

    &:first-of-type {
      border-top-left-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
      button[data-rich-text-editor-control] {
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
      }
    }

    &:last-of-type {
      border-bottom-left-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
      button[data-rich-text-editor-control] {
        border-bottom-left-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
      }
    }
  }
`;

export { ControlsGroupWrapper };
