import { Icon } from 'modules/common/components';
import { FlexItem } from 'modules/common/components/step/styles';
import { colors, dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { ITag, ITagDoc, ITagField } from 'modules/tags/types';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Tags } from '..';
import TagsForm from '../TagsForm';

const TagContainer = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const CustomerCounts = styled.div`
  text-align: center;

  > i {
    color: ${colors.colorCoreLightGray};
  }
`;

const Show = styledTS<{ show: boolean }>(styled.div)`
  display: ${props => (props.show ? 'block' : 'none')};
`;

type Props = {
  onChange: (name: 'tagId', value: string) => void;
  tags: ITag[];
  tagFields: ITagField[];
  tagAdd: (params: { doc: ITagDoc }) => void;
  tagCounts: any;
  count: (tag: ITagDoc) => void;
  tagId: string;
  operation: string;
};

type State = {
  tagId: string;
};

class TagStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      tagId: props.tagId || ''
    };
  }

  createTag = createTag => {
    if (createTag === true) {
      this.changeTag('');
    }
  };

  changeTag = tagId => {
    this.setState({ tagId });
    this.props.onChange('tagId', tagId);
  };

  renderTags(show) {
    /**
     * Render tags when show === false
     */
    if (!show) {
      return (
        <TagContainer>
          <Tags
            tags={this.props.tags}
            changeTags={this.changeTag}
            counts={this.props.tagCounts}
            defaultValue={this.state.tagId}
          />
        </TagContainer>
      );
    }
    return null;
  }

  render() {
    const show = this.props.operation === 'createTag';

    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          {this.renderTags(show)}
          <Show show={show}>
            <TagsForm
              fields={this.props.tagFields}
              create={this.props.tagAdd}
              createTag={this.createTag}
              count={this.props.count}
            />
          </Show>
        </FlexItem>
        <FlexItem direction="column" v="center" h="center">
          <CustomerCounts>
            <Icon icon="users" size={50} />
            <p>
              {this.props.tagCounts[this.state.tagId] || 0} {__('customers')}
            </p>
          </CustomerCounts>
        </FlexItem>
      </FlexItem>
    );
  }
}

export default TagStep;
