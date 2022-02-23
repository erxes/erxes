import { colors } from '../../styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const RichEditorRoot = styledTS<{ bordered: boolean }>(styled.div)`
  font-size: 14px;
  position: relative;
  padding-top: 36px;
  border: ${props => props.bordered && `1px solid ${colors.borderDarker}`};
  margin-top: ${props => props.bordered && '10px'};

  img {
    max-width: 100%;
  }

  .RichEditor-editor {
    border-top: 1px solid ${colors.borderPrimary};
    cursor: text;

    .public-DraftEditorPlaceholder-root {
      padding: 15px 20px;
      position: absolute;
      color: ${colors.colorCoreGray};
      font-size: 13px;
    }

    .public-DraftEditorPlaceholder-inner {
      color: ${colors.colorCoreLightGray};
    }

    blockquote {
      border-left: 5px solid #DEE4E7;
      color: #888;
      font-style: italic;
      padding: 10px 20px;
    }

    .public-DraftEditor-content {
      font-size: 13px;
      min-height: ${props => (props.bordered ? '180px' : '100px')};
      padding: 15px 20px;
      overflow-y: auto;
      max-height: 60vh;

      a {
        text-decoration: underline;
      }
    }
  } 
`;

const RichEditorControlsRoot = styledTS<{ isTopPopup: boolean }>(styled.div)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  padding: 0 7px;
  background: ${colors.colorWhite};
  max-height: 36px;

  > div {
    box-shadow: none;
    background: none;
    border: 0;
    border-radius: 0;

    input {
      width: 100%;
      height: 36px;
      font-size: 14px;
    }

    button {
      color: ${colors.colorCoreGray};
      height: 36px;
      width: 36px;
      padding: 0;
      background: none;
      font-size: 16px;
      font-weight: 500;
      vertical-align: bottom;
      border: none;
      border-radius: 0;
      transition: background 0.3s ease;

      &:hover {
        cursor: pointer;
      }

      svg {
        height: 36px;
        width: 18px;
      }
    }
  }

  select {
    background: none;
    border: none;
    height: 36px;
    outline: 0;
    color: ${colors.colorCoreGray};
    position: absolute;
    top: 0;
    right: 10px;
    background: ${colors.colorWhite};
  }

  .draftJsEmojiPlugin__emojiSelectPopover__1J1s0 {
    margin: 0;
    bottom: ${props => props.isTopPopup && '100%'};
    border-color: ${colors.borderPrimary};
    box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.1);

    h3 {
      background: #fafafa;
      margin: 3px 0 0 0;
      font-weight: 500;
    }

    > div {
      height: 160px;
      margin: 0;
    }
  }
`;

const Char = styledTS<{ count: number }>(styled.div)`
  color: ${props =>
    props.count > 10
      ? props.count < 30 && colors.colorCoreOrange
      : colors.colorCoreRed};
  font-weight: bold;
  display:flex;
  justify-content:flex-end;
  padding-top:10px;
  padding-right:15px;
  font-size:12px;
`;

export { RichEditorRoot, RichEditorControlsRoot, Char };
