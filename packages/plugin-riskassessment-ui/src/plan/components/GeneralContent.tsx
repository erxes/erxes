import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import {
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column, DateContainer } from '@erxes/ui/src/styles/main';
import React from 'react';
import Select from 'react-select-plus';
import { FormContainer } from '../../styles';
import { CARDTYPES, STRUCTURETYPES } from '../common/constants';
import { SelectStructure } from '../common/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { SelectTags } from '../../indicator/common/utils';
type Props = {
  onChange: (value, name) => void;
  plan: any;
};

type State = {
  useGroup: boolean;
};

class GeneralConfig extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      useGroup: false
    };
  }

  render() {
    const { plan, onChange } = this.props;
    const { useGroup } = this.state;
    const { structureType, configs } = plan;

    const handleChange = (e: React.FormEvent<HTMLElement>) => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      onChange(value, name);
    };

    const handleConfigChange = (value, name) => {
      onChange({ ...configs, [name]: value }, 'configs');
    };

    return (
      <FormContainer padding="15px" column>
        <FormGroup>
          <ControlLabel required>{__('Name')}</ControlLabel>
          <FormControl
            name="name"
            defaultValue={plan?.name}
            placeholder="Type a name"
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Structure Type')}</ControlLabel>
          <Select
            name="structureType"
            placeholder={__('Select structure Type')}
            value={plan?.structureType}
            options={STRUCTURETYPES}
            multi={false}
            onChange={props => onChange(props?.value, 'structureType')}
          />
        </FormGroup>
        <SelectStructure
          name="structureTypeId"
          label="General"
          structureType={structureType || ''}
          structureTypeId={plan?.structureTypeId}
          onChange={onChange}
          multi={false}
        />
        {isEnabled('tags') && (
          <FormGroup>
            <ControlLabel>{__('Tags')}</ControlLabel>
            <SelectTags
              name="tagId"
              label="Choose Tags"
              initialValue={plan.tagId}
              onSelect={onChange}
            />
          </FormGroup>
        )}
        {structureType && (
          <>
            <FormGroup>
              <ControlLabel>{__('Card Type')}</ControlLabel>
              <Select
                name="type"
                placeholder={__('Select card type')}
                value={configs?.cardType}
                options={CARDTYPES}
                multi={false}
                onChange={props =>
                  onChange({ ...configs, cardType: props?.value }, 'configs')
                }
              />
            </FormGroup>
            {configs?.cardType && (
              <BoardSelectContainer
                type={configs?.cardType}
                boardId={configs?.boardId}
                pipelineId={configs?.pipelineId}
                stageId={configs?.stageId}
                onChangeBoard={value => handleConfigChange(value, 'boardId')}
                onChangePipeline={value =>
                  handleConfigChange(value, 'pipelineId')
                }
                onChangeStage={value => handleConfigChange(value, 'stageId')}
                autoSelectStage
              />
            )}
          </>
        )}

        <Columns style={{ gap: '20px' }}>
          <Column>
            <FormGroup>
              <ControlLabel>{__('Create Date')}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="createDate"
                  value={plan.createDate}
                  placeholder="select from create date "
                  onChange={date => onChange(date, 'createDate')}
                />
              </DateContainer>
            </FormGroup>
          </Column>
          <Column>
            <FormGroup>
              <ControlLabel>{__('Start Date')}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startDate"
                  value={plan.startDate}
                  placeholder="select from start date "
                  onChange={date => onChange(date, 'startDate')}
                />
              </DateContainer>
            </FormGroup>
          </Column>
          <Column>
            <FormGroup>
              <ControlLabel>{__('End Date')}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="closeDate"
                  value={plan.closeDate}
                  placeholder="select from end date "
                  onChange={date => onChange(date, 'closeDate')}
                />
              </DateContainer>
            </FormGroup>
          </Column>
        </Columns>
      </FormContainer>
    );
  }
}

export default GeneralConfig;
