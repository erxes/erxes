import { Show } from 'modules/engage/styles';
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import { TagsForm } from '../forms';
import Common from './Common';

type Props = {
  tagId: string;
  renderContent: any;
  tags: ITag[];
  counts: any;
  onChange: (name: 'tagId', value: string) => void;
  tagAdd: (params: { doc: { name: string; description: string } }) => void;
};

type State = {
  tagId: string;
  createTag: boolean;
};

class TagStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tagId: props.tagId || '',
      createTag: false
    };
  }

  createTag = (createTag: boolean) => {
    this.setState({ createTag });

    if (createTag === true) {
      this.changeTag('');
    }
  };

  changeTag = (tagId: string) => {
    this.setState({ tagId });
    this.props.onChange('tagId', tagId);
  };

  renderComponentContent = ({
    actionSelector,
    customerCounts,
    listContent
  }) => {
    const { renderContent, tagAdd } = this.props;
    const { createTag } = this.state;

    const componentContent = (
      <>
        {listContent}
        <Show show={createTag}>
          <TagsForm create={tagAdd} createTag={this.createTag} />
        </Show>
      </>
    );

    return renderContent({ actionSelector, componentContent, customerCounts });
  };

  render() {
    const { tags, counts } = this.props;
    const { tagId, createTag } = this.state;

    const onChange = () => this.createTag(false);
    const onChangeBrand = () => this.createTag(true);

    return (
      <Common
        id={tagId}
        type="tag"
        name="createTag"
        onChange={onChange}
        onChangeToggle={onChangeBrand}
        changeList={this.changeTag}
        listCount={counts}
        customers={counts[tagId] || 0}
        list={tags}
        checked={createTag}
        content={this.renderComponentContent}
      />
    );
  }
}

export default TagStep;
