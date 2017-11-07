import { injectGlobal } from 'styled-components';
import 'ionicons/css/ionicons.min.css';
import { typography, colors } from './';

injectGlobal`
  html {
    height: 100%;
  }

  body {
		font-family: 'Montserrat', 'PT Sans Caption', 'Arial',  sans-serif;
    margin: 0;
    font-weight: 300;
    font-size: ${typography.fontSizeBody}px;
    line-height: ${typography.lineHeightBody};
    color: ${colors.textPrimary};
    height: 100%;
    background: ${colors.bgMain};

    > #root {
      display: flex;
      flex: 1;
      height: 100%;
    }
  }

  a {
    color: #A389D4;
    transition: color 0.3s ease;
  }

  a:hover {
    color: inherit;
    text-decoration: none;
  }

  .text-primary {
    color: #04A9F5 !important;
  }

  .text-success {
    color: #67C682 !important;
  }

  .text-warning {
    color: #F5C22B !important;
  }
  /* override */
  .modal-backdrop {
    background-color: #30435C;
  } !important

  .modal-backdrop.in {
    opacity: 0.8;
  }

  .modal-dialog {
    margin: 50px auto;
  }

  .modal-content {
    border-radius: 0;
    border: 0;
    box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    padding: 13px 20px;
    height: 50px;
    border: 0;
    border-radius: 0;
    background: #A389D4;
  }

  .modal-header .close {
    margin-top: 0;
    outline: 0;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 300;
    color: #fff;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 0;
    margin-top: 20px;
    border: none;
  }

  .close {
    font-weight: 300;
    text-shadow: none;
    color: #fff;
    opacity: 0.8;
    font-size: 34px;
    line-height: 25px;
  }

  .close:hover {
    opacity: 1;
    color: #fff;
  }

  /* dropdow */

  .dropdown-menu {
    margin-top: 0;
    border-radius: 0;
    border-color: #eee;
    color: #444;
    min-width: 100%;
    box-shadow: 0 1px 2px 0 #ddd;
  }

  .dropdown-menu > span {
    display: block;
  }

  .dropdown-menu li a {
    display: block;
    padding: 3px 20px;
    color: #444;
    white-space: nowrap;
  }

  .dropdown-menu > li > a {
    color: #444;
    font-weight: 300;
  }

  .dropdown-menu > li > a:focus,
  .dropdown-menu > li > a:hover,
  .dropdown-menu li a:focus,
  .dropdown-menu li a:hover {
    color: #222;
    background: #f5f5f5;
    outline: 0;
  }

  /* tooltip */

  .tooltip-inner {
    background-color: #393C40;
    border-radius: 0;
  }

  .tooltip.bottom .tooltip-arrow {
    border-bottom-color: #393C40;
  }

  .tooltip.top .tooltip-arrow {
    border-top-color: #393C40;
  }

  .tooltip.left .tooltip-arrow {
    border-left-color: #393C40;
  }

  .tooltip.right .tooltip-arrow {
    border-right-color: #393C40;
  }

  /* popover */

  .popover {
    font-family: 'Montserrat','Helvetica Neue','Helvetica','Arial', sans-serif;
    border: 1px solid #eee;
    border-radius: 0;
    padding: 0;
    color: #888;
    font-weight: inherit;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);
  }

  .popover.bottom > .arrow {
    border-bottom-color: #eee;
  }

  .popover.bottom > .arrow::after {
    top: 1px;
    border-bottom-color: #fafafa;
  }

  .popover-title {
    font-weight: 400;
    border-bottom: 1px solid #eee;
    padding: 10px 20px;
    background: #fafafa;
    font-size: 11px;
    text-transform: uppercase;
    color: #888;
  }

  .popover-content {
    padding: 0;
  }

  ::-webkit-scrollbar {
    width: 5px;
    height: 7px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(215, 215, 215, .5);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, .2);
  }
`;
