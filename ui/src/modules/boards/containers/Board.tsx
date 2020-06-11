import React from 'react';
import { RootBack, ScrolledContent } from '../styles/common';
import { IOptions, IPipeline } from '../types';
import Pipeline from './Pipeline';
import withPipeline from './withPipeline';

type Props = {
  queryParams: any;
  options: IOptions;
  pipeline: IPipeline;
};

const Board = (props: Props) => {
  const { pipeline, queryParams, options } = props;

  return (
    <RootBack style={{ backgroundColor: pipeline.bgColor }}>
      <ScrolledContent>
        <Pipeline
          options={options}
          pipeline={pipeline}
          key={pipeline._id}
          queryParams={queryParams}
        />
      </ScrolledContent>
    </RootBack>
  );
};

export default withPipeline(Board);
