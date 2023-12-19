import styled from 'styled-components';

const ControlsGroupWrapper = styled.div`
  display: flex;
  > div {
    display: flex;
  }

  .dropdown-menu {
    transform: translate3d(0px, 28px, 0px) !important;
    padding: 0;
  }

  .dropdown-item {
    padding: 0;

    &:active {
      background-color: transparent;
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

  .dropdown-toggle {
    background: transparent;
    border: 0.0625rem solid #ced4da;
    border-left: none;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
`;

export { ControlsGroupWrapper };
