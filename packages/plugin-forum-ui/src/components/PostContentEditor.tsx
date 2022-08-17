import React, { useState } from 'react';
import { EditorState, RichUtils } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import 'draft-js/dist/Draft.css';
import createToolbarPlugin, { Separator } from 'draft-js-static-toolbar-plugin';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import {
  ItalicButton,
  BoldButton,
  SupButton,
  SubButton,
  CodeButton,
  UnderlineButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
  AlignBlockDefaultButton,
  AlignBlockCenterButton,
  AlignBlockLeftButton,
  AlignBlockRightButton
} from 'draft-js-buttons';

const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;

const PostContentEditor: React.FC = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  return (
    <div style={{ height: 800 }}>
      <Toolbar>
        {// may be use React.Fragment instead of div to improve perfomance after React 16
        externalProps => (
          <>
            <BoldButton {...externalProps} />
            <ItalicButton {...externalProps} />
            <UnderlineButton {...externalProps} />
            <CodeButton {...externalProps} />
            <Separator {...externalProps} />
            <HeadlineOneButton {...externalProps} />
            <HeadlineTwoButton {...externalProps} />
            <HeadlineThreeButton {...externalProps} />
            <UnorderedListButton {...externalProps} />
            <OrderedListButton {...externalProps} />
            <BlockquoteButton {...externalProps} />
            <CodeBlockButton {...externalProps} />
            <SupButton {...externalProps} />
            <SubButton {...externalProps} />
            <AlignBlockDefaultButton {...externalProps} />
            {/*   <AlignBlockCenterButton {...externalProps} />
            <AlignBlockLeftButton {...externalProps} />
            <AlignBlockRightButton {...externalProps} /> */}
          </>
        )}
      </Toolbar>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        plugins={[staticToolbarPlugin]}
        customStyleMap={{
          SUBSCRIPT: { fontSize: '0.8em', verticalAlign: 'sub' },
          SUPERSCRIPT: { fontSize: '0.7em', verticalAlign: 'super' }
        }}
      />
    </div>
  );
};

export default PostContentEditor;
