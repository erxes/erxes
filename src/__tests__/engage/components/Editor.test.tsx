// test passed
import { EditorState } from 'draft-js';
import { mount, shallow } from 'enzyme';
import Editor from 'modules/engage/components/Editor';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('Editor component', () => {
  const defaultProps = {
    editorState: new EditorState(),
    onEditorStateChange: (state: EditorState) => null,
    onChange: (name: 'content', getContent: string) => null
  };

  test('renders successfully', () => {
    shallow(<Editor {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<Editor {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
