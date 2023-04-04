import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import SelectCategories from './configs/containers/SelectCategories';
import SelectTags from './configs/containers/SelectTags';

type Props = {
  onChangeConfig: (code: string, value: any) => void;
  configsMap: IConfigsMap;
};

const labels = {
  fttbTagId: 'FTTB Tag',
  ftthTagId: 'FTTH Tag',
  suhTagId: 'SUH Tag',
  vooCatId: 'VOO Category',

  hbbCatId: 'HBB Category',
  installationTicketsStageId: 'INSTALLATION REQUEST CONFIG',
  repairTicketsStageId: 'REPAIR REQUEST CONFIG',
  capitalTagId: 'Capital Tag'
};

const MobinetConfigs = (props: Props) => {
  const configs = props.configsMap.MOBINET_CONFIGS || {
    fttbTagId: '',
    ftthTagId: '',
    vooCatId: '',
    hbbCatId: '',
    suhTagId: '',
    installationTicket: { boardId: '', pipelineId: '', stageId: '' },
    repairTicket: { boardId: '', pipelineId: '', stageId: '' },
    capitalTagId: ''
  };

  console.log(configs);

  React.useEffect(() => {
    props.onChangeConfig('MOBINET_CONFIGS', props.configsMap.MOBINET_CONFIGS);
  }, [props.configsMap]);

  const onChange = e => {
    const { name, value } = e.target;

    props.onChangeConfig('MOBINET_CONFIGS', {
      ...configs,
      [name]: value
    });
  };

  const onChangeTags = (name, option) => {
    props.onChangeConfig('MOBINET_CONFIGS', {
      ...configs,
      [name]: option.value
    });
  };

  const onChangeCategory = (name, option) => {
    props.onChangeConfig('MOBINET_CONFIGS', {
      ...configs,
      [name]: option.value
    });
  };

  const onChangeStage = (name, value) => {
    console.log(value);
    console.log(name);
    props.onChangeConfig('MOBINET_CONFIGS', {
      ...configs,
      [name]: value
    });
  };

  const renderItem = (
    key: string,
    description?: string,
    componentClass?: string,
    type?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{labels[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          id={key}
          name={key}
          componentClass={componentClass}
          defaultValue={configs[key]}
          onChange={onChange}
          type={type}
        />
      </FormGroup>
    );
  };

  return (
    <>
      <CollapseContent title="Mobinet">
        <FormGroup>
          <ControlLabel>{labels.fttbTagId}</ControlLabel>
          <SelectTags
            value={configs.fttbTagId}
            type={'products:product'}
            onChange={value => onChangeTags('fttbTagId', value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{labels.ftthTagId}</ControlLabel>
          <SelectTags
            type={'products:product'}
            value={configs.ftthTagId}
            onChange={value => onChangeTags('ftthTagId', value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{labels.capitalTagId}</ControlLabel>
          <SelectTags
            type={'products:product'}
            value={configs.capitalTagId}
            onChange={value => onChangeTags('capitalTagId', value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{labels.capitalTagId}</ControlLabel>
          <SelectTags
            type={'products:product'}
            value={configs.capitalTagId}
            onChange={value => onChangeTags('capitalTagId', value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{labels.suhTagId}</ControlLabel>
          <SelectTags
            type={'contacts:company'}
            value={configs.suhTagId}
            onChange={value => onChangeTags('suhTagId', value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{labels.vooCatId}</ControlLabel>
          <SelectCategories
            value={configs.vooCatId}
            onChange={value => onChangeCategory('vooCatId', value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{labels.hbbCatId}</ControlLabel>
          <SelectCategories
            value={configs.hbbCatId}
            onChange={value => onChangeCategory('hbbCatId', value)}
          />
        </FormGroup>
        <CollapseContent
          title={''}
          description={labels.installationTicketsStageId}
        >
          <BoardSelect
            type={'ticket'}
            stageId={configs.installationTicket.stageId || ''}
            boardId={configs.installationTicket.boardId || ''}
            pipelineId={configs.installationTicket.pipelineId || ''}
            onChangeStage={value => {
              onChangeStage('installationTicket', {
                ...configs.installationTicket,
                stageId: value
              });
            }}
            onChangePipeline={value => {
              onChangeStage('installationTicket', {
                ...configs.installationTicket,
                pipelineId: value
              });
            }}
            onChangeBoard={value => {
              onChangeStage('installationTicket', {
                ...configs.installationTicket,
                boardId: value
              });
            }}
          />
        </CollapseContent>

        <CollapseContent description={labels.repairTicketsStageId} title={''}>
          <BoardSelect
            type={'ticket'}
            stageId={configs.repairTicket.stageId || ''}
            boardId={configs.repairTicket.boardId || ''}
            pipelineId={configs.repairTicket.pipelineId || ''}
            onChangeStage={value => {
              onChangeStage('repairTicket', {
                ...configs.repairTicket,
                stageId: value
              });
            }}
            onChangePipeline={value => {
              onChangeStage('repairTicket', {
                ...configs.repairTicket,
                pipelineId: value
              });
            }}
            onChangeBoard={value => {
              onChangeStage('repairTicket', {
                ...configs.repairTicket,
                boardId: value
              });
            }}
          />
        </CollapseContent>
      </CollapseContent>
    </>
  );
};

export default MobinetConfigs;
