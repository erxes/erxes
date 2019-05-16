import { Show } from 'modules/engage/styles';
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import { TagsForm } from '../forms';
import Common from './Common';

type Props = {
  tagIds: string[];
  renderContent: any;
  tags: ITag[];
  counts: any;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  tagAdd: (params: { doc: { name: string; description: string } }) => void;
};

type State = {
  tagIds: string[];
  createTag: boolean;
};

class TagStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tagIds: props.tagIds || [],
      createTag: false
    };
  }

  createTag = (createTag: boolean) => {
    this.setState({ createTag });

    if (createTag === true) {
      this.changeTag([]);
    }
  };

  changeTag = (tagIds: string[]) => {
    this.setState({ tagIds });
    this.props.onChange('tagIds', tagIds);
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
    const { tagIds, createTag } = this.state;

    const onChange = () => this.createTag(false);
    const onChangeBrand = () => this.createTag(true);

    return (
      <Common
        ids={tagIds}
        type="tag"
        name="createTag"
        onChange={onChange}
        onChangeToggle={onChangeBrand}
        changeList={this.changeTag}
        counts={counts}
        customers={0}
        list={tags}
        checked={createTag}
        content={this.renderComponentContent}
      />
    );
  }
}

export default TagStep;
