import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IConfigsMap } from '../types';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
  conditions: any[];
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false,
      conditions: props.config.conditions || []
    };
  }

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ config: { ...this.state.config, stageId } });
  };

  onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = this.props;
    const { config } = this.state;
    const key = config.stageId;

    delete configsMap.dealsProductsDataSplit[currentConfigKey];
    configsMap.dealsProductsDataSplit[key] = config;
    this.props.save(configsMap);
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;
    this.setState({ config });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  render() {
    const { config } = this.state;
    return (
      <CollapseContent
        title={__(config.title)}
        open={this.props.currentConfigKey === 'newPlacesConfig' ? true : false}
      >
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{'Title'}</ControlLabel>
              <FormControl
                defaultValue={config['title']}
                onChange={this.onChangeInput.bind(this, 'title')}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
            <FormGroup>
              <BoardSelectContainer
                type="deal"
                autoSelectStage={false}
                boardId={config.boardId}
                pipelineId={config.pipelineId}
                stageId={config.stageId}
                onChangeBoard={this.onChangeBoard}
                onChangePipeline={this.onChangePipeline}
                onChangeStage={this.onChangeStage}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{'Product Category'}</ControlLabel>
              <SelectProductCategory
                label="Choose product category"
                name="productCategoryIds"
                initialValue={config.productCategoryIds || ''}
                customOption={{
                  value: '',
                  label: '...Clear product category filter'
                }}
                onSelect={categoryIds =>
                  this.onChangeConfig('productCategoryIds', categoryIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Exclude categories')}</ControlLabel>
              <SelectProductCategory
                name="excludeCategoryIds"
                label="Choose categories to exclude"
                initialValue={config.excludeCategoryIds}
                onSelect={categoryIds =>
                  this.onChangeConfig('excludeCategoryIds', categoryIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Exclude products')}</ControlLabel>
              <SelectProducts
                name="excludeProductIds"
                label="Choose products to exclude"
                initialValue={config.excludeProductIds}
                onSelect={productIds =>
                  this.onChangeConfig('excludeProductIds', productIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Segment')}</ControlLabel>
              <SelectSegments
                name="segments"
                label="Choose segments"
                contentTypes={['products:product']}
                initialValue={config.segments}
                multi={true}
                onSelect={segmentIds =>
                  this.onChangeConfig('segments', segmentIds)
                }
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.onDelete}
            uppercase={false}
          >
            Delete
          </Button>

          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={this.onSave}
            uppercase={false}
            disabled={config.stageId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerSettings;
