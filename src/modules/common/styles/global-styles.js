import { injectGlobal } from 'styled-components';
import { typography, colors } from './';

injectGlobal`
  html {
    height: 100%;
  }

  body {
		font-family: 'Montserrat', 'PT Sans Caption', 'Arial',  sans-serif;
    margin: 0;
    font-size: ${typography.fontSizeBody}px;
    line-height: ${typography.lineHeightBody};
    color: ${colors.textPrimary};
    height: 100%;
    background: ${colors.bgMain};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;

    > #root {
      display: flex;
      flex: 1;
      height: 100%;
    }
  }

  a {
    color: #1785fc;
    transition: color 0.3s ease;
  }

  a:hover {
    color: inherit;
    text-decoration: none;
  }

  .text-primary {
    color: #6569DF !important;
  }

  .text-success {
    color: #3CCC38 !important;
  }

  .text-warning {
    color: #F7CE53 !important;
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

  .modal-dialog.full {
    width: 85%;
  }

  .modal-content {
    border-radius: 2px;
    border: 0;
    box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);
    background: #fafafa;
  }

  .modal-header {
    padding: 15px 40px;
    height: 50px;
    border: 0;
    border-radius: 2px;
    background: #673FBD;
  }

  .modal-header .close {
    outline: 0;
  }

  .modal-title {
    font-size: 16px;
    font-weight: normal;
    color: #fff;
  }

  .modal-body {
    padding: 40px 40px 30px 40px;
  }

  .modal-footer {
    padding: 0;
    margin-top: 40px;
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
    border: none;
    font-size: 13px;
    color: #444;
    min-width: 100%;
    box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);
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
    font-weight: normal;
  }

  .dropdown-menu > li > a:focus,
  .dropdown-menu > li > a:hover,
  .dropdown-menu li a:focus,
  .dropdown-menu li a:hover {
    color: #222;
    background: #f5f5f5;
    outline: 0;
    cursor: pointer;
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
    border: none;
    border-radius: 0;
    font-size: inherit;
    padding: 0;
    color: #444;
    font-weight: inherit;
    box-shadow: 0 0 20px 3px rgba(0, 0, 0, 0.15);
  }

  .popover.bottom > .arrow {
    border-bottom-color: #eee;
  }

  .popover.bottom > .arrow::after {
    top: 1px;
    border-bottom-color: #fafafa;
  }

  .popover > .arrow {
    border-width: 10px;
  }

  .popover.top > .arrow {
    bottom: -10px;
    margin-left: -10px;
    border-top-color: #eee;
  }

  .popover.top > .arrow::after {
    bottom: 1px;
    border-top-color: #fff;
  }

  .popover-title {
    display: block;
    border-bottom: 1px solid #eee;
    padding: 10px 20px;
    background: #fafafa;
    font-size: 11px;
    text-transform: uppercase;
    color: #888;
    border-radius: 0;
  }

  .popover-content {
    padding: 0;
    position: relative;
  }

  .popover-content ul {
    max-height: 280px;
    overflow: auto;
    min-width: 260px;
  }

  .popover-content li a i {
    margin-left: 0;
  }

  .popover-template {
    max-width: 405px;
    width: 405px;
    height: 400px;
  }
  .popover-template .popover-content {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 33px;
  }

  .notification-popover {
    right: 15px;
    max-width: 360px;
  }

  /* select  */

  .Select-control {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid #ddd;
    box-shadow: none;
    background: none;
  }

  .Select-control:hover {
    cursor: pointer;
    box-shadow: none;
  }

  .Select.is-open .Select-arrow {
    border-top-color: #777777;
  }

  .Select.is-focused > .Select-control,
  .Select.is-open > .Select-control {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-color: ${colors.colorSecondary};
    background: none;
  }

  .Select.is-focused:not(.is-open) > .Select-control {
    box-shadow: none;
    background: none;
    border-color: #6569DF;
  }

  .Select.is-focused .Select-input > input {
    padding: 10px 0 12px;
  }

  .Select-placeholder,
  .Select-input,
  .Select--single > .Select-control .Select-value {
    padding-left: 10px;
    padding-right: 10px;
  }

  .Select-clear {
    font-size: 20px;
    line-height: 1.4;
  }

  .Select-clear-zone:hover {
    color: #e85a5a;
  }

  .Select--multi .Select-multi-value-wrapper {
    padding: 0 5px;
  }

  .Select--multi .Select-input {
    margin-left: 5px;
  }

  .Select--multi .Select-value {
    background-color: #6569DF;
    border-radius: 11px;
    border: 1px solid #6569DF;
    color: #fff;
    margin-top: 6px;
    margin-left: 0;
    margin-right: 5px;
    position: relative;
    padding-right: 20px;
  }

  .Select--multi .Select-value-icon {
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    position: absolute;
    right: 0;
    top: 0;
    text-align: center;
    line-height: 20px;
    background: rgba(0, 0, 0, 0.1);
    padding: 0;
  }

  .Select--multi .Select-value-icon:hover,
  .Select--multi .Select-value-icon:focus,
  .Select--multi .Select-value-icon:active {
    background-color: #0876a9;
    color: #fff;
  }

  .Select--multi .Select-value-label {
    padding: 2px 10px;
  }

  .Select--multi.has-value .Select-input {
    margin-left: 5px;
  }

  .Select--multi a.Select-value-label {
    color: #452679;
  }

  .Select-arrow-zone {
    padding-right: 10px;
  }

  .Select-arrow-zone:hover > .Select-arrow {
    border-top-color: #777777;
  }

  .Select-menu-outer {
    border-color: ${colors.colorShadowGray};
    margin-top: 1px;
    box-shadow: 0 0 4px ${colors.shadowPrimary};
  }

  .Select-menu-outer, .Select-option:last-child {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .Select-option-group-label {
    background-color: #fafafa;
    color: #666;
    border-bottom: 1px solid #eee;
    border-top: 1px solid #eee;
    font-weight: 500;
    text-transform: uppercase;
    padding: 8px 20px;
  }

  .Select-option-group-label ~ .Select-option {
    padding-left: 20px;
  }

  .Select-option-group-label .Select-option-group {
    padding-left: 20px;
  }

  .Select-option {
    padding: 8px 20px;
  }

  .Select-noresults {
    padding: 8px 20px;
  }

  .simple-option .channel-round {
    color: #fff;
    font-weight: bold;
    width: 20px;
    height: 20px;
    float: right;
    border-radius: 10px;
    background: #F7CE53;
    text-align: center;
    font-size: 10px;
    line-height: 20px;
    cursor: pointer;
  }

  /* react toggle */

  .react-toggle--checked .react-toggle-track {
    background-color: #3CCC38;
  }

  .react-toggle-track {
    background-color: #393C40;
  }

  .react-toggle-track span {
    display: none;
  }

  .react-toggle--checked .react-toggle-thumb,
  .react-toggle--checked:hover:not(.react-toggle--disabled) .react-toggle-track {
    border-color: #3CCC38;
  }

  /* punch card */

  .punch-card .axis path,
  .punch-card .axis line {
    fill: none;
    stroke: #777777;
    stroke-width: 1px;
    shape-rendering: crispEdges;
  }
  .punch-card .axis text {
    font-size: 0.875em;
    fill: #777777;
  }

  /* react datetime */

  .rdtPicker {
    box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.15);
    width: 100%;
    border-color: ${colors.colorShadowGray};
    min-width: 200px;
    max-width: 260px;
  }

  .rdtPicker td.rdtToday:before {
    border-bottom: 7px solid #6569DF;
  }

  .rdtPicker td.rdtActive, 
  .rdtPicker td.rdtActive:hover {
    background-color: #6569DF;
  }

  .rdtPicker th,
  .rdtPicker tfoot {
    border-color: #eee;
  }

  /* editor */
  .RichEditor-editor .public-DraftEditor-content ul {
    padding-left: 25px;
  }

  .RichEditor-editor .public-DraftEditor-content ol {
    padding-left: 25px;
  }

  .RichEditor-editor .public-DraftEditor-content h3 {
    margin-top: 0;
  }

  .RichEditor-editor .RichEditor-blockquote {
    border-left: 5px solid #ddd;
    color: #777777;
    font-style: italic;
    padding: 10px 20px;
  }

  .RichEditor-editor .public-DraftStyleDefault-pre {
    margin-bottom: 0;
  }
  .RichEditor-editor .public-DraftStyleDefault-pre pre {
    padding: 0;
    margin: 0;
    border: 0;
  }

  .RichEditor-hidePlaceholder .public-DraftEditorPlaceholder-root {
    display: none;
  }

  /* mention */
  .draftJsMentionPlugin__mention__29BEd {
    cursor: pointer;
    display: inline-block;
    font-weight: bold;
    padding-left: 2px;
    padding-right: 2px;
    border-radius: 4px;
    text-decoration: none;
  }

  .draftJsMentionPlugin__mention__29BEd:visited {
    cursor: pointer;
    display: inline-block;
    font-weight: bold;
    padding-left: 2px;
    padding-right: 2px;
    text-decoration: none;
  }

  .draftJsMentionPlugin__mention__29BEd:hover {
    outline: 0;
  }

  .draftJsMentionPlugin__mention__29BEd:focus {
    outline: 0;
  }

  .draftJsMentionPlugin__mention__29BEd:active {
    color: #333;
  }

  .draftJsMentionPlugin__mentionSuggestions__2DWjA {
    position: absolute;
    min-width: 220px;
    width: 100%;
    background: #fff;
    box-shadow: 0 0 10px -3px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    z-index: 2000;
    box-sizing: border-box;
    transform: scale(0);
    bottom: 100%;
    top: auto !important;
    left: 0 !important;
    max-height: 300px;
    overflow: auto;
  }

  .draftJsMentionPlugin__mentionSuggestionsEntry__3mSwm {
    padding: 5px 10px;
    transition: background-color 0.4s cubic-bezier(0.27, 1.27, 0.48, 0.56);
    font-size: 13px;
  }

  .draftJsMentionPlugin__mentionSuggestionsEntry__3mSwm:active {
    background-color: #eee;
  }

  .draftJsMentionPlugin__mentionSuggestionsEntryFocused__3LcTd {
    background-color: #F6F8FB;
  }

  .mentioned-person {
    cursor: pointer;
    display: inline-block;
    font-weight: bold;
    padding-left: 2px;
    padding-right: 2px;
    text-decoration: none;
  }

  .mention {
    text-decoration: none;
  }

  .mentionSuggestionsEntryContainer {
    display: flex;
  }

  .mentionSuggestionsEntryContainerRight {
    display: flex;
    padding-left: 8px;
    flex: 1;
    flex-direction: row;
    align-items: center;
  }

  .mentionSuggestionsEntryText,
  .mentionSuggestionsEntryTitle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mentionSuggestionsEntryText {
    margin-right: 8px;
    font-weight: bold;
  }

  .mentionSuggestionsEntryTitle {
    font-size: 95%;
    color: #888;
    margin-top: 2px;
  }

  .mentionSuggestionsEntryAvatar {
    display: block;
    width: 22px;
    height: 22px;
    border-radius: 50%;
  }

  /* other */
  .sidebar-accordion {
    background: #f8f8f8;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
  }

  .sidebar-accordion .popover-header {
    background: none;
  }

  .sidebar-accordion .popover-list {
    max-height: none;
  }

  /* icon select */

  .icon-option {
    display: flex;
    align-items: center;
  }
  .icon-option svg {
    margin-right: 10px;
    fill: #6569DF;
  }

  /* scrollbar */

  ::-webkit-scrollbar {
    width: 6px;
    height: 8px;
    border-radius: 0;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(215, 215, 215, .6);
    border-radius: 0;
    border: 1px solid #ddd;
  }

  ::-webkit-scrollbar-track {
    background: rgba(215, 215, 215, .35);
  }
`;
