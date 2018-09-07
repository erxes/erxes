import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { Label } from 'modules/common/components';

const TagList = styled.div.attrs({
  className: props => props.length > 0 && 'tags'
})`
  > span {
    margin-right: ${dimensions.unitSpacing / 2}px;

    &:last-child {
      margin: 0;
    }
  }
`;

function Tags({ tags, limit }) {
  const length = tags.length;

  return (
    <TagList length={length}>
      {tags.slice(0, limit ? limit : length).map(tag => (
        <Label
          key={tag.name}
          style={{ backgroundColor: tag.colorCode }}
          ignoreTrans
        >
          <span>{tag.name}</span>
        </Label>
      ))}
      {limit &&
        length - limit > 0 && (
          <Label
            style={{ backgroundColor: colors.colorCoreLightGray }}
            ignoreTrans
          >
            <span>{`+${length - limit}`}</span>
          </Label>
        )}
    </TagList>
  );
}

Tags.propTypes = {
  tags: PropTypes.array.isRequired,
  limit: PropTypes.number
};

export default Tags;
