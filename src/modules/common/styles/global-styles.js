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
    text-rendering: optimizeLegibility;

    > #root {
      display: flex;
      flex: 1;
      height: 100%;
    }
  }

  a {
    color: #297cbb;
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
    font-weight: normal;
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
    font-size: inherit;
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

  .popover.top > .arrow {
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
    border-radius: 18px;
    border: 1px solid #ddd;
    box-shadow: none;
  }

  .Select-control:hover {
    cursor: pointer;
    box-shadow: none;
  }

  .is-open .Select-arrow {
    border-top-color: #777777;
  }

  .is-open > .Select-control {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-color: #ddd;
  }

  .is-focused:not(.is-open) > .Select-control {
    box-shadow: none;
  }

  .is-focused .Select-input > input {
    padding: 10px 0 12px;
  }

  .Select-placeholder {
    padding-left: 20px;
    padding-right: 20px;
  }

  .Select-input {
    padding-left: 20px;
    padding-right: 20px;
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
    margin-left: 15px;
  }

  .Select--multi .Select-value {
    background-color: #04a9f5;
    border-radius: 11px;
    border: 1px solid #04a9f5;
    color: #fff;
    margin-top: 6px;
    position: relative;
    padding-right: 20px;
  }

  .Select--single > .Select-control .Select-value {
    padding-left: 20px;
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
    background: #F5C22B;
    text-align: center;
    font-size: 10px;
    line-height: 20px;
    cursor: pointer;
  }

  /* react toggle */

  .react-toggle--checked .react-toggle-track {
    background-color: #67C682;
  }

  .react-toggle-track {
    background-color: #393C40;
  }

  .react-toggle-track span {
    display: none;
  }

  .react-toggle--checked .react-toggle-thumb,
  .react-toggle--checked:hover:not(.react-toggle--disabled) .react-toggle-track {
    border-color: #67c682;
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

  /* react datepicker */

  .react-datepicker,
  .react-datepicker__current-month,
  .react-datepicker-time__header {
    font-size: 12px;
    color: #444;
  }

  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    display: block;
  }

  .react-datepicker {
    border-color: #ddd !important;
    box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.15);
  }

  .react-datepicker .react-datepicker__day--selected,
  .react-datepicker .react-datepicker__day--keyboard-selected {
    background-color: #04A9F5;
    border-radius: 4px;
    color: #fff;
  }

  .react-datepicker .react-datepicker__day--selected:hover,
  .react-datepicker .react-datepicker__day--keyboard-selected:hover {
    background-color: #67C682;
  }

  .react-datepicker .react-datepicker__header {
    background: #fafafa;
    border-color: #ddd;
  }

  .react-datepicker .react-datepicker__triangle {
    border-bottom-color: #fafafa !important;
  }

  .react-datepicker .react-datepicker__triangle::before {
    border-bottom-color: #ddd !important;
  }

  .react-datepicker__day-name,
  .react-datepicker__day,
  .react-datepicker__time-name {
    color: #333333;
    width: 24px;
    line-height: 24px;
    margin: 3px;
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
    fill: #04A9F5;
  }

  /* scrollbar */

  ::-webkit-scrollbar {
    width: 5px;
    height: 7px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(215, 215, 215, .5);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(215, 215, 215, .25);
  }
`;
