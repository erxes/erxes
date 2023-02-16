import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { DefaultWrapper, SelectCustomFields } from '../../common/utils';
import { cardTypes, subMenu } from '../../common/constants';
import {
  BarItems,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HeaderDescription,
  ModalTrigger,
  Sidebar,
  SortHandler,
  Table,
  confirm,
  __
} from '@erxes/ui/src';
import Form from '../containers/Form';
import Row from './Row';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import Select from 'react-select-plus';
import { SidebarHeader, Padding } from '../../styles';

type Props = {
  queryParams: any;
  history: any;
  configs: any[];
  totalCount: number;
  remove: (configIds: string[]) => void;
} & IRouterProps;

type State = {
  selectedItems: string[];
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: []
    };
  }

  renderForm() {
    const trigger = <Button btnStyle="success">Add Configs</Button>;

    const content = ({ closeModal }) => {
      return <Form {...this.props} closeModal={closeModal} />;
    };

    return (
      <ModalTrigger
        content={content}
        trigger={trigger}
        title="Add config risk assessment"
        size="lg"
      />
    );
  }

  renderContent() {
    const { configs } = this.props;

    const { selectedItems } = this.state;

    const selectAllItems = () => {
      if (!selectedItems.length) {
        const configIds = configs.map(config => config._id);
        return this.setState({ selectedItems: configIds });
      }

      this.setState({ selectedItems: [] });
    };

    const selectItem = id => {
      if (selectedItems.includes(id)) {
        const removedSelectedItems = selectedItems.filter(
          selectItem => selectItem !== id
        );
        return this.setState({ selectedItems: removedSelectedItems });
      }
      this.setState({ selectedItems: [...selectedItems, id] });
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentClass="checkbox"
                checked={configs.length === selectedItems.length}
                onClick={selectAllItems}
              />
            </th>
            <th>{__('Board')}</th>
            <th>{__('Pipeline')}</th>
            <th>{__('Stage')}</th>
            <th>{__('Field')}</th>
            <th>{__('Risk Assessment')}</th>
            <th>
              <SortHandler sortField="createdAt" />
              {__('Created At')}
            </th>
            <th>
              <SortHandler sortField="modifiedAt" />
              {__('Modified At')}
            </th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {configs.map(config => (
            <Row
              {...this.props}
              key={config._id}
              config={config}
              checked={selectedItems.includes(config._id)}
              selectItem={selectItem}
            />
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { totalCount, remove, queryParams } = this.props;
    const { selectedItems } = this.state;

    const handleRemove = () => {
      confirm().then(() => {
        remove(selectedItems);
        this.setState({ selectedItems: [] });
      });
    };

    const handleFilterParams = (type, value) => {
      if (!value) {
        if (type === 'cardType') {
          for (const param of [
            'cardType',
            'boardId',
            'pipelineId',
            'stageId'
          ]) {
            removeParams(this.props.history, param);
          }
          return;
        }
        return removeParams(this.props.history, type);
      }
      setParams(this.props.history, { [type]: value });
    };

    const sidebar = (
      <Sidebar
        full
        header={<SidebarHeader>{__('Addition Filters')}</SidebarHeader>}
      >
        <Padding horizontal>
          <FormGroup>
            <ControlLabel>{__('Type')}</ControlLabel>
            <Select
              placeholder={__('Select Type')}
              value={queryParams?.cardType}
              options={cardTypes}
              multi={false}
              onChange={e => handleFilterParams('cardType', e?.value)}
            />
          </FormGroup>
          <BoardSelectContainer
            type={queryParams?.cardType}
            boardId={queryParams?.boardId}
            pipelineId={queryParams?.pipelineId}
            stageId={queryParams?.stageId}
            onChangeBoard={e => handleFilterParams('boardId', e)}
            onChangePipeline={e => handleFilterParams('pipelineId', e)}
            onChangeStage={e => handleFilterParams('stageId', e)}
            autoSelectStage={false}
          />
          <FormGroup>
            <ControlLabel>{__('Custom field')}</ControlLabel>
            <SelectCustomFields
              label="Select Custom Field"
              name="customField"
              initialValue={queryParams?.customFieldId}
              onSelect={({ _id }) => handleFilterParams('customFieldId', _id)}
              type={queryParams?.cardType}
            />
          </FormGroup>
        </Padding>
      </Sidebar>
    );

    const rightActionBar = (
      <BarItems>
        {selectedItems.length > 0 && (
          <Button btnStyle="danger" onClick={handleRemove}>
            Delete
          </Button>
        )}
        {this.renderForm()}
      </BarItems>
    );

    const leftActionBar = (
      <HeaderDescription
        title="Configs"
        icon="/images/actions/25.svg"
        description="You can configure your risk assessment work assign to your team members automatically on tasks tickets"
      />
    );

    const updatedProps = {
      title: 'Configrations',
      content: this.renderContent(),
      rightActionBar,
      leftActionBar,
      subMenu,
      totalCount,
      sidebar
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
