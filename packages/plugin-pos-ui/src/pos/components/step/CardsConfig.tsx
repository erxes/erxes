import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import { Alert, Button, __ } from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { Block, FlexColumn, FlexItem, FlexRow } from '../../../styles';
import { IConfigsMap, IPos } from '../../../types';
import PerConfigs from '../cardsGroup/PerConfigs';

type Props = {
  onChange: (name: 'cardsConfig', value: any) => void;
  pos?: IPos;
};

const CardsConfig = (props: Props) => {
  const { pos, onChange } = props;

  const [config, setConfig] = useState<IConfigsMap>(
    pos && pos.cardsConfig ? pos.cardsConfig : {},
  );

  const [fieldsCombined, setFieldsCombined] = useState<FieldsCombinedByType[]>(
    [],
  );

  useEffect(() => {
    if (isEnabled('forms')) {
      client
        .query({
          query: gql(formQueries.fieldsCombinedByContentType),
          variables: {
            contentType: 'cards:deal',
          },
        })
        .then(({ data }) => {
          setFieldsCombined(data ? data.fieldsCombinedByContentType : [] || []);
        });
    }
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();

    setConfig((prevConfig) => ({
      ...prevConfig,
      newCardsConfig: {
        branchId: '',
        boardId: '',
        pipelineId: '',
        stageId: '',
        assignedUserIds: [],
        deliveryMapField: '',
      },
    }));
  };

  const handleDelete = (currentConfigKey: string) => {
    delete config[currentConfigKey];

    setConfig(config);
    onChange('cardsConfig', config);

    Alert.success('You successfully deleted stage in cards settings.');
  };

  const handleEdit = (key, currenConfig: any) => {
    delete config[key];
    config[currenConfig.branchId] = { ...currenConfig };

    setConfig(config);
    onChange('cardsConfig', config);
  };

  const renderCollapse = () => {
    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={handleAdd}
        icon="plus"
        uppercase={false}
      >
        New config
      </Button>
    );
    return (
      <FlexRow>
        <LeftItem>
          {actionButtons}
          <br />
          <br />
          {Object.keys(config).map((key) => (
            <PerConfigs
              key={key}
              config={config[key]}
              fieldsCombined={fieldsCombined}
              configKey={key}
              save={handleEdit}
              delete={handleDelete}
            />
          ))}
        </LeftItem>
      </FlexRow>
    );
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>{renderCollapse()}</Block>
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default CardsConfig;
