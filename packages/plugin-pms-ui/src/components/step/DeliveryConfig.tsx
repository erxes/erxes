import BoardSelectContainer from '@erxes/ui-sales/src/boards/containers/BoardSelect';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { __ } from '@erxes/ui/src';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../styles';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import { IPmsBranch } from '../../types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';

type Props = {
  onChange: (name: 'pipelineConfig', value: any) => void;
  pms?: IPmsBranch;
};

const DeliveryConfig = (props: Props) => {
  const { pms, onChange } = props;

  const [config, setConfig] = useState<any>(
    pms && pms.pipelineConfig
      ? pms.pipelineConfig
      : {
          boardId: '',
          pipelineId: '',
          stageId: ''
        }
  );

  const [fieldsCombined, setFieldsCombined] = useState<FieldsCombinedByType[]>(
    []
  );

  useEffect(() => {
    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          contentType: 'sales:deal'
        }
      })
      .then(({ data }) => {
        setFieldsCombined(data ? data.fieldsCombinedByContentType : []);
      });
  }, []);

  useEffect(() => {
    setConfig(pms?.pipelineConfig || {});
  }, [pms]);

  const onChangeConfig = (code: string, value) => {
    const newConfig = { ...config, [code]: value };

    setConfig(newConfig);
    onChange('pipelineConfig', newConfig);
  };

  const onChangeBoard = (boardId: string) => {
    onChangeConfig('boardId', boardId);
  };

  const onChangePipeline = (pipelineId: string) => {
    onChangeConfig('pipelineId', pipelineId);
  };

  const onChangeStage = (stageId: string) => {
    onChangeConfig('stageId', stageId);
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          {(isEnabled('sales') && (
            <Block>
              <h4>{__('Stage')}</h4>
              <BlockRow>
                <BoardSelectContainer
                  type='deal'
                  autoSelectStage={true}
                  autoSelectPipeline={true}
                  boardId={config?.boardId}
                  pipelineId={config?.pipelineId}
                  stageId={config?.stageId}
                  onChangeBoard={onChangeBoard}
                  onChangePipeline={onChangePipeline}
                  onChangeStage={onChangeStage}
                />
              </BlockRow>
            </Block>
          )) ||
            'Please, enabled cards plugin'}
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default DeliveryConfig;
