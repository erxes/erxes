import { gql } from '@apollo/client';
import { queries as boardsQueries } from '@erxes/ui-cards/src/boards/graphql';
import { selectOptions } from '@erxes/ui-cards/src/boards/utils';
import { ControlLabel, FormGroup, __ } from '@erxes/ui/src';
import React, { useEffect, useState } from 'react';
import Select from 'react-select-plus';

export default function SelectBoard({
  type,
  params,
  onSelect,
  subdomain,
  appToken
}: {
  type: string;
  onSelect: (name: string, value: string) => void;
  params: any;
  subdomain: string;
  appToken: string;
}) {
  const [boards, setBoards] = useState([]) as any[];
  const [pipelines, setPipelines] = useState([]) as any[];
  const [stages, setStages] = useState([]) as any;

  const [loading, setLoading] = useState({
    boards: false,
    pipelines: false,
    stages: false
  });

  const loadData = (key, params, handleSetState, query) => {
    setLoading({ ...loading, [key]: true });
    fetch(`https://${subdomain}.app.erxes.io/gateway/graphql`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'erxes-app-token': appToken
      },
      body: JSON.stringify({
        query: gql(query).loc?.source.body,
        variables: { ...params }
      })
    })
      .then(response => response.json())
      .then(({ data }) => {
        const list = data[key] || [];
        handleSetState(list);
        setLoading({ ...loading, [key]: false });
      });
  };

  useEffect(() => {
    loadData('boards', { type }, setBoards, boardsQueries.boards);

    if (params?.boardId) {
      loadData(
        'pipelines',
        { boardId: params?.boardId },
        setPipelines,
        boardsQueries.pipelines
      );
    }

    if (params?.pipelineId) {
      loadData(
        'stages',
        { pipelineId: params?.pipelineId },
        setStages,
        boardsQueries.stages
      );
    }
  }, [type]);

  const renderOptions = option => {
    return (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );
  };

  const renderSelect = (placeholder, value, onChange, options, loading) => {
    return (
      <Select
        isRequired={true}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        optionRenderer={renderOptions}
        options={options}
        clearable={false}
        loading={loading}
      />
    );
  };

  const handleSelect = (name, value, callback?) => {
    onSelect(name, value);
    callback && callback();
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>{__('Board')}</ControlLabel>
        {renderSelect(
          'Choose a board',
          params?.boardId,
          item =>
            handleSelect(
              'boardId',
              item.value,
              loadData(
                'pipelines',
                { boardId: item.value },
                setPipelines,
                boardsQueries.pipelines
              )
            ),
          selectOptions(boards),
          loading.boards
        )}
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__('Pipelines')}</ControlLabel>
        {renderSelect(
          'Choose a pipeline',
          params?.pipelineId,
          item =>
            handleSelect(
              'pipelineId',
              item.value,
              loadData(
                'stages',
                { pipelineId: item.value },
                setStages,
                boardsQueries.stages
              )
            ),
          selectOptions(pipelines),
          loading.pipelines
        )}
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__('Stages')}</ControlLabel>
        {renderSelect(
          'Choose a stage',
          params?.stageId,
          item => handleSelect('stageId', item.value),
          selectOptions(stages),
          loading.stages
        )}
      </FormGroup>
    </>
  );
}
