import { CompositeDecorator } from 'draft-js';
import React from 'react';

type Props = {
  contentState: any;
  entityKey: any;
};

const EmbeddedImage = (props: Props) => {
  const {
    height,
    src,
    width,
  } = props.contentState.getEntity(props.entityKey).getData();

  return (
    <img src={src} height={height} width={width} alt={src} />
  );
};

const findImageEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'IMAGE'
      );
    },
    callback
  );
}

const getDraftDecorator = () => {
  return new CompositeDecorator([
    {
      strategy: findImageEntities,
      component: EmbeddedImage
    }
  ]);
};

export {
  EmbeddedImage,
  findImageEntities,
  getDraftDecorator
};
