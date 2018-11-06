import { FormControl, Icon } from 'modules/common/components';
import { FlexItem } from 'modules/common/components/step/styles';
import { colors, dimensions } from 'modules/common/styles';
import { ITag } from 'modules/tags/types';
import { ITagField } from 'modules/tags/types';
import * as React from 'react';
import styled from 'styled-components';
import { Tags, TagsForm } from '..';

const TagContainer = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;
const CustomerCounts = styled.div`
  text-align: center;

  > i {
    color: ${colors.colorCoreLightGray};
  }
`;

type Props = {
  onChange: (name: 'tagId', value: string) => void;
  tags: ITag[];
  tagFields: ITagField[];
  // tagAdd: (params: ITag) => void;
  counts: any;
  count: (tag: ITag) => void;
  tagId: string;
};

type State = {
  tagId: string;
  createTag: boolean;
};

class TagStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      tagId: props.tagId || '',
      createTag: false
    };
  }

  createTag = createTag => {
    this.setState({ createTag });

    if (createTag === true) {
      this.changeTag('');
    }
  };

  changeTag = tagId => {
    this.setState({ tagId });
    this.props.onChange('tagId', tagId);
  };

  renderTags(show) {
    if (!show) {
      return (
        <TagContainer>
          <Tags
            tags={this.props.tags}
            changeTags={this.changeTag}
            counts={this.props.counts}
            defaultValue={this.state.tagId}
          />
        </TagContainer>
      );
    }

    return null;
  }

  render() {
    const show = this.state.createTag;
    const onChange = () => this.createTag(false);
    const onChangeTag = () => this.createTag(true);
    this.props.tags.map(tag => tag.name);
    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          {this.renderTags(show)}
        </FlexItem>
        <FlexItem direction="column" v="center" h="center">
          <CustomerCounts>
            <Icon icon="users" size={50} />
            <p>{this.props.counts[this.state.tagId] || 0}</p>
          </CustomerCounts>
        </FlexItem>
      </FlexItem>
    );
  }
}

export default TagStep;
