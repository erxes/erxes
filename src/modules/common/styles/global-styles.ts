import { injectGlobal } from 'styled-components';
import { colors, typography } from './';

const style = `
html {
  height: 100%;
}

body {
  font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
  margin: 0;
  font-size: ${typography.fontSizeBody}px;
  line-height: ${typography.lineHeightBody};
  color: ${colors.textPrimary};
  height: 100%;
  background: ${colors.bgMain};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: 100%;

  > #root {
    display: flex;
    flex: 1;
    height: 100%;
    flex-direction: column;
  }
}

a {
  color: ${colors.linkPrimary};
  transition: color 0.3s ease;
}

a:hover {
  color: inherit;
  text-decoration: none;
}

.text-primary {
  color: ${colors.colorSecondary} !important;
}

.text-success {
  color: ${colors.colorCoreGreen} !important;
}

.text-warning {
  color: ${colors.colorCoreYellow} !important;
}
/* override */

.modal-backdrop {
  background-color: #30435C;
} !important

.modal-backdrop.in {
  opacity: 0.8;
}

.modal.in .modal-dialog {
  transform: none;
}

.modal.in .modal-dialog.transform {
  transform: translate(0,0);
}

.modal-dialog {
  padding: 50px 0;
  margin: 0 auto;
}

.modal-dialog.middle {
  width: 65%;
}

.modal-dialog.full {
  width: 85%;
}

.modal-1000w {
  width: 1000px;
}

.modal-content {
  border-radius: 2px;
  border: 0;
  box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);
  background: ${colors.bgLight};
}

.modal-header {
  padding: 15px 40px;
  border: 0;
  border-radius: 2px;
  background: #673FBD;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.modal-header .close {
  outline: 0;
  margin-top: -4px;
  font-weight: 200;
}

.modal-title {
  font-size: ${typography.fontSizeHeading7}px;
  font-weight: normal;
  color: ${colors.colorWhite};
}

.modal-body {
  padding: 30px 40px;
}

.modal-footer {
  padding: 0;
  margin-top: 30px;
  border: none;
}

.wide-modal {
  width: 90%;
}

.close {
  font-weight: ${typography.fontWeightLight};
  text-shadow: none;
  color: ${colors.colorWhite};
  opacity: 0.8;
  font-size: 34px;
  line-height: 25px;
}

.close:hover {
  opacity: 1;
  color: ${colors.colorWhite};
}

/* transition */

.fade-in-appear,
.fade-in-enter {
  opacity: 0.1;
}

.fade-in-appear-active,
.fade-in-enter-active {
  opacity: 1;
  transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.fade-in-exit,
.fade-in-exit-active {
  opacity: 0.1;
  transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.slide-in-small-appear,
.slide-in-small-enter {
  opacity: 0;
  transform: translateY(10px);
}

.slide-in-small-appear-active,
.slide-in-small-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.slide-in-small-exit,
.slide-in-small-exit-active {
  opacity: 0;
  transform: translateY(10px);
  transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

/* dropdown */

.dropdown-menu {
  margin-top: 0 !important;
  border: none;
  font-size: ${typography.fontSizeBody}px;
  color: ${colors.textPrimary};
  min-width: 100%;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);
}

.dropdown-menu > span {
  display: block;
}

.dropdown-menu li a,
.dropdown-menu li button {
  display: block;
  padding: 3px 20px;
  color: ${colors.textPrimary};
  white-space: nowrap;
  float: none;
  margin: 0;
}

.dropdown-menu > li > a {
  color: ${colors.textPrimary};
  font-weight: normal;
}

.dropdown-menu > li > a:focus,
.dropdown-menu > li > a:hover,
.dropdown-menu li a:focus,
.dropdown-menu li a:hover,
.dropdown-menu li button:focus,
.dropdown-menu li button:hover {
  color: ${colors.colorCoreDarkGray};
  background: ${colors.bgActive};
  outline: 0;
  cursor: pointer;
}

/* tooltip */
.tooltip {
  font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
}

.tooltip-inner {
  background-color: ${colors.colorWhite};
  color: ${colors.colorCoreDarkGray};
  box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.23);
}

.tooltip.bottom .tooltip-arrow {
  border-bottom-color: ${colors.colorWhite};
}

.tooltip.top .tooltip-arrow {
  border-top-color: ${colors.colorWhite};
}

.tooltip.left .tooltip-arrow {
  border-left-color: ${colors.colorWhite};
}

.tooltip.right .tooltip-arrow {
  border-right-color: ${colors.colorWhite};
  border-width: 0px 10px 13px 0;
  margin-top: 0;
  top: 0 !important;
}

.tooltip.right .tooltip-inner {
  border-top-left-radius: 0;
}

.tooltip.in {
  opacity: 1;
}

.tooltip.right {
  padding: 0 5px 0 6px;
}

/* popover */

.popover {
  font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
  border: none;
  border-radius: 4px;
  font-size: inherit;
  padding: 0;
  color: ${colors.textPrimary};
  font-weight: inherit;
  box-shadow: 0 0 20px 3px rgba(0, 0, 0, 0.15);
  max-width: 310px;
}

.popover.bottom > .arrow {
  border-bottom-color: ${colors.borderPrimary};
}

.popover.bottom > .arrow::after {
  top: 1px;
  border-bottom-color: ${colors.bgLight};
}

.popover > .arrow {
  border-width: 10px;
}

.popover.top > .arrow {
  bottom: -10px;
  margin-left: -10px;
  border-top-color: ${colors.borderPrimary};
}

.popover.top > .arrow::after {
  bottom: 1px;
  border-top-color: ${colors.colorWhite};
}

.popover-title {
  display: block;
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: 10px 20px;
  background: ${colors.bgLight};
  font-size: ${typography.fontSizeUppercase}px;
  text-transform: uppercase;
  color: ${colors.colorCoreGray};
  border-radius: 4px 4px 0 0;
}

.popover-content {
  padding: 0;
  position: relative;
  min-width: 260px;
}

.popover-content .chrome-picker {
  width: 100% !important;
  box-shadow: none !important;
}

.popover-content ul {
  max-height: 280px;
  overflow: auto;
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
  height: 34px;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid ${colors.borderDarker};
  box-shadow: none;
  background: none;
}

.Select-input {
  height: 33px;
}

.Select-control:hover {
  cursor: pointer;
  box-shadow: none;
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
  border-color: ${colors.colorSecondary};
}

.Select.is-focused .Select-input > input {
  padding: 10px 0 12px;
}

.Select.is-disabled > .Select-control {
  cursor: not-allowed;
}

.Select-placeholder,
.Select-input,
.Select--single > .Select-control .Select-value {
  padding-left: 0;
  padding-right: 0;
}

.Select-clear {
  font-size: ${typography.fontSizeHeading6}px;
  line-height: 1.4;
}

.Select-clear-zone:hover {
  color: ${colors.colorCoreRed};
}

.Select--multi .Select-multi-value-wrapper {
  padding: 0 5px 0 0;
}

.Select--multi .Select-input {
  margin-left: 0;
}

.Select--multi .Select-value {
  background-color: ${colors.colorSecondary};
  border-radius: 11px;
  border: 1px solid ${colors.colorSecondary};
  color: ${colors.colorWhite};
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
  background-color: rgba(0, 0, 0, 0.2);
  color: ${colors.colorWhite};
}

.Select--multi .Select-value-label {
  padding: 2px 10px;
}

.Select--multi.has-value .Select-input {
  margin-left: 5px;
}

.Select--multi a.Select-value-label {
  color: ${colors.colorPrimaryDark};
}

.Select-arrow-zone {
  padding-right: 0;
  width: 20px;
}

.Select-arrow-zone > .Select-arrow {
  border: none;
  margin-right: 10px;
}

.Select .Select-arrow:before {
  font-family: 'erxes';
  font-size: 10px;
  content: '\\e827';
  color: ${colors.colorCoreGray};
}

.Select.is-open .Select-arrow:before {
  content: '\\e89a';
}

.Select-menu-outer {
  border: none;
  margin-top: 1px;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);;
}

.Select-menu-outer, .Select-option:last-child {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.Select-option-group-label {
  background-color: ${colors.bgLight};
  color: #666;
  border-bottom: 1px solid ${colors.borderPrimary};
  border-top: 1px solid ${colors.borderPrimary};
  font-weight: ${typography.fontWeightMedium};
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
  color: ${colors.colorWhite};
  font-weight: bold;
  width: 20px;
  height: 20px;
  float: right;
  border-radius: 10px;
  background: ${colors.colorCoreYellow};
  text-align: center;
  font-size: 10px;
  line-height: 20px;
  cursor: pointer;
}

/* react toggle */

.react-toggle--checked .react-toggle-track {
  background-color: ${colors.colorCoreGreen};
}

.react-toggle-track {
  background-color: ${colors.colorCoreBlack};
}

.react-toggle-track span {
  display: none;
}

.react-toggle--checked .react-toggle-thumb,
.react-toggle--checked:hover:not(.react-toggle--disabled) .react-toggle-track {
  border-color: ${colors.colorCoreGreen};
}

/* punch card */

.punch-card .axis path,
.punch-card .axis line {
  fill: none;
  stroke: ${colors.colorCoreGray};
  stroke-width: 1px;
  shape-rendering: crispEdges;
}
.punch-card .axis text {
  font-size: 0.875em;
  fill: ${colors.colorCoreGray};
}

/* react datetime */

.rdtPicker {
  box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.15) !important;
  width: 100%;
  border: none !important;
  min-width: 220px;
  max-width: 260px;
}

.rdtPicker td.rdtToday:before {
  border-bottom: 7px solid ${colors.colorSecondary} !important;
}

.rdtPicker td.rdtActive,
.rdtPicker td.rdtActive:hover {
  background-color: ${colors.colorSecondary} !important;
}

.rdtPicker th,
.rdtPicker tfoot {
  border-color: ${colors.borderPrimary};
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
  border-left: 5px solid ${colors.borderDarker};
  color: ${colors.colorCoreGray};
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
  color: ${colors.colorCoreDarkGray};
}

.draftJsMentionPlugin__mentionSuggestions__2DWjA {
  position: absolute;
  min-width: 220px;
  width: 100%;
  background: ${colors.colorWhite};
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
  font-size: ${typography.fontSizeBody}px;
}

.draftJsMentionPlugin__mentionSuggestionsEntry__3mSwm:active {
  background-color: ${colors.borderPrimary};
}

.draftJsMentionPlugin__mentionSuggestionsEntryFocused__3LcTd {
  background-color: ${colors.bgUnread};
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
  color: ${colors.colorCoreGray};
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
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom: 1px solid ${colors.borderPrimary};
  margin-bottom: 10px;

  ul {
    padding-top: 0;
    max-height: none;
  }
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

.icon-option i {
  margin-right: 10px;
  font-size: ${typography.fontSizeHeading6}px;
  color: ${colors.colorPrimaryDark};
}

/* scrollbar */

::-webkit-scrollbar {
  width: 8px;
  height: 10px;
  border-radius: 0;
}

::-webkit-scrollbar-thumb {
  background: #bfc8cd;
  border-radius: 1px;
}

::-webkit-scrollbar-thumb:active {
  background: #b0bbc0;
  border-radius: 1px;
}

::-webkit-scrollbar-track {
  background: rgba(10, 45, 65, .08);
}

::-webkit-scrollbar-track:active {
  background: rgba(10, 45, 65, .1);
}

/* svg */

.checkmark {
  transform-origin: 50% 50%;
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: stroke .3s cubic-bezier(0.650, 0.000, 0.450, 1.000) .1s forwards;
}

.svg-spinner-path {
  stroke: ${colors.colorCoreGray};
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 0, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -30;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -100;
  }
}

/* ckEditor */
  .editor-avatar {
    width: 25px;
    margin-right: 4px;
    border-radius: 11px;
  }
  .editor-id {
    display: none;
  }

  .rdt {
    display: block !important;
  }

  .modal-close-date {
    width: 330px;
  }
`;

const globalStyle = [`${style}`] as any;

globalStyle.raw = [`${style}`];

injectGlobal(globalStyle);
