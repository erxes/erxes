import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { Column, Columns, Footer, Title } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import BoardSelect from '../../containers/BoardSelect';
import { IOptions } from '../../types';

type Props = {
  data: any;
  onSelect: (datas: any[]) => void;
  clearState: () => void;
  clearStateStage: () => void;
  datas: any[];
  title: string;
  // onChangeItems: () => void;
  renderName: (data: any) => void;
  renderForm: (props: { closeModal: () => void }) => any;
  limit?: number;
  add?: any;
  closeModal: () => void;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  showSelect?: boolean;
  options: IOptions;
  search: (value: string) => void;
  filterStageId: (stageId: string) => void;
};

type State = {
  datas: any[];
  searchValue: string;
  stageId: string;
  name: string;
  disabled: boolean;
  boardId: string;
  pipelineId: string;
};

class ItemChooser extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    const datas = this.props.data.datas || [];

    this.state = {
      datas,
      searchValue: '',
      stageId: '',
      name: '',
      disabled: false,
      boardId: '',
      pipelineId: ''
    };
  }

  onSelect = () => {
    this.props.onSelect(this.state.datas);
    this.props.closeModal();
  };

  // componentWillUnmount() {
  //   this.props.clearStateStage();
  //   this.props.clearState();
  // }

  // componentWillReceiveProps() {
  //   this.setState({});
  // }

  handleChange = (type, data) => {
    const { datas } = this.state;

    if (type === 'add') {
      if (this.props.limit && this.props.limit === datas.length) {
        return;
      }

      this.setState({ datas: [...datas, data] });
    } else {
      this.setState({ datas: datas.filter(item => item !== data) });
    }
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { search } = this.props;
    const value = e.target.value;

    this.timer = setTimeout(() => {
      search(value);
      this.setState({ searchValue: value });
    }, 500);
  };

  renderRow(data, icon) {
    if (icon === 'add' && this.state.datas.some(e => e._id === data._id)) {
      return null;
    }

    const onClick = () => this.handleChange(icon, data);

    return (
      <li key={data._id} onClick={onClick}>
        {this.props.renderName(data)}
        <Icon icon={icon} />
      </li>
    );
  }

  renderSelected(selectedDatas) {
    if (selectedDatas.length) {
      return (
        <ul>
          {selectedDatas.map(data => this.renderRow(data, 'minus-circle'))}
        </ul>
      );
    }

    return <EmptyState text="No items added" icon="list-2" />;
  }

  renderSelect() {
    const { showSelect, options } = this.props;

    if (!showSelect) {
      return null;
    }

    const { stageId, pipelineId, boardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <BoardSelect
        type={options.type}
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
      />
    );
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    console.log(name, value);
    // this.timer = setTimeout(() => {
    if (name === 'stageId') {
      const { filterStageId } = this.props;
      filterStageId(value as string);
    }
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
    // }, 500);
  };

  render() {
    const { renderForm, datas, title, data, closeModal } = this.props;
    const selectedDatas = this.state.datas;

    const addTrigger = (
      <p>
        {__("Don't see the result you're looking for? ")}
        <span>{__(`Create a new ${title}`)}</span>
      </p>
    );

    return (
      <>
        <Columns>
          <Column>{this.renderSelect()}</Column>
          <Column>
            <FormControl
              placeholder={__('Type to search')}
              onChange={this.search}
            />
            <ul>{datas.map(dataItem => this.renderRow(dataItem, 'add'))}</ul>
          </Column>
          <Column>
            <Title>
              {data.name}
              &apos;s {title}
              <span>({selectedDatas.length})</span>
            </Title>
            {this.renderSelected(selectedDatas)}
          </Column>
        </Columns>
        <ModalFooter>
          <Footer>
            <ModalTrigger
              title={`New ${title}`}
              trigger={addTrigger}
              size="lg"
              content={renderForm}
            />
            <div>
              <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
                Cancel
              </Button>
              <Button
                btnStyle="success"
                onClick={this.onSelect}
                icon="checked-1"
              >
                Select
              </Button>
            </div>
          </Footer>
        </ModalFooter>
      </>
    );
  }
}

export default ItemChooser;
