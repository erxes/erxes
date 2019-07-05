import { Label } from 'modules/common/components';
import { colors, dimensions } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ITag } from '../../tags/types';

const TagList = styledTS<{ length: number }>(styled.div).attrs({
  className: props => (props.length > 0 ? 'tags' : '')
})`
  > span {
    margin-right: ${dimensions.unitSpacing / 2}px;

    &:last-child {
      margin: 0;
    }
  }
`;

type Props = {
  tags: ITag[];
  size?: string;
  limit?: number;
};

function Tags({ tags, limit }: Props) {
  const length = tags.length;

  return (
    <TagList length={length}>
      {tags.slice(0, limit ? limit : length).map(tag => (
        <Label
          key={tag.name}
          style={{ backgroundColor: tag.colorCode }}
          ignoreTrans={true}
        >
          <span>{tag.name}</span>
        </Label>
      ))}
      {limit && length - limit > 0 && (
        <Label
          style={{ backgroundColor: colors.colorCoreLightGray }}
          ignoreTrans={true}
        >
          <span>{`+${length - limit}`}</span>
        </Label>
      )}
    </TagList>
  );
}

export default Tags;
