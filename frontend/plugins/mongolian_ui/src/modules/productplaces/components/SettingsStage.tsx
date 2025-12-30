import React from 'react';
import { Button } from 'erxes-ui';
import { contentBoxClass } from '../styles';
import { IConfigsMap, PerPrintConfig } from '../types';
import PerPrint from './PerPrint';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const SettingsStage = (props: Props) => {
  const { configsMap, save } = props;

  /* =========================
   * ADD NEW CONFIG
   * ========================= */
  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const configKey = `config_${Date.now()}`;

    const newPlacesConfig: PerPrintConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataPlaces: {
        ...(configsMap.dealsProductsDataPlaces || {}),
        [configKey]: newPlacesConfig,
      },
    };

    save(updatedConfigsMap);
  };

  /* =========================
   * DELETE CONFIG
   * ========================= */
  const deleteHandler = (currentConfigKey: string) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataPlaces: {
        ...(configsMap.dealsProductsDataPlaces || {}),
      },
    };

    delete updatedConfigsMap.dealsProductsDataPlaces![currentConfigKey];

    save(updatedConfigsMap);
  };

  /* =========================
   * SAVE SINGLE CONFIG
   * ========================= */
  const saveHandler = (key: string, config: PerPrintConfig) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataPlaces: {
        ...(configsMap.dealsProductsDataPlaces || {}),
        [key]: config,
      },
    };

    save(updatedConfigsMap);
  };

  /* =========================
   * RENDER CONFIGS
   * ========================= */
  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataPlaces || {};

    return Object.keys(configs).map((key) => (
      <PerPrint
        key={key}
        config={configs[key] as PerPrintConfig}
        currentConfigKey={key}
        save={saveHandler}
        delete={deleteHandler}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">Stage Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure product stage settings
        </p>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={add}
          className="flex items-center gap-2"
        >
          + New Config
        </Button>
      </div>

      {/* Content */}
      <div className={contentBoxClass}>
        {renderConfigs()}
      </div>
    </div>
  );
};

export default SettingsStage;
