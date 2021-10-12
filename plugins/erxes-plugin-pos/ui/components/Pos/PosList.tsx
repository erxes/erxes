import {
  __,
  Button,
  DataWithLoader,
  Icon,
  MainStyleTopHeader as TopHeader,
  ModalTrigger,
  router,
  Sidebar,
  Tip,
  Wrapper
} from 'erxes-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import PosForm from '../../containers/Pos/PosForm';
import PosList from '../../containers/Pos/PosList';
import { ActionButtons, SidebarListItem } from '../../styles';
import { IPos } from '../../types';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  refetch: any;
  remove: (carCategoryId: string) => void;
  posList: IPos[];
  loading: boolean;
}

class List extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, pos?: IPos) {
    const content = props => <PosForm {...props} pos={pos} />;

    const title = pos ? 'Edit POS' : 'Add POS';

    return <ModalTrigger title={title} trigger={trigger} content={content} />;
  }

  isActive = (id: string) => {
    const { queryParams = { posId: '' } } = this.props;

    const currentPos = queryParams.posId || '';

    return currentPos === id;
  };

  renderEditAction(pos: IPos) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, pos);
  }

  renderRemoveAction(pos: IPos) {
    // const { remove } = this.props;
    // return (
    //   <Button btnStyle="link" onClick={remove.bind(null, pos._id)}>
    //     <Tip text={__('Remove')} placement="bottom">
    //       <Icon icon="cancel-1" />
    //     </Tip>
    //   </Button>
    // );
  }

  renderContent() {
    const { posList } = this.props;

    const result: React.ReactNode[] = [];

    for (const [index, pos] of posList.entries()) {
      console.log(index, pos);

      const order = index.toString();

      const m = order.match(/[/]/gi);

      let space = '';

      if (m) {
        space = '\u00a0\u00a0'.repeat(m.length);
      }

      result.push(
        <SidebarListItem key={pos._id} isActive={this.isActive(pos._id)}>
          <Link to={`?posId=${pos._id}`}>
            {space}
            {pos.name}
          </Link>
          <ActionButtons>
            {this.renderEditAction(pos)}
            {this.renderRemoveAction(pos)}
          </ActionButtons>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderHeader() {
    const trigger = (
      <Button
        btnStyle="success"
        uppercase={false}
        icon="plus-circle"
        block={true}
      >
        Add pos
      </Button>
    );

    return (
      <>
        <TopHeader>{this.renderFormTrigger(trigger)}</TopHeader>
        <Section.Title>{__('Pos list')}</Section.Title>
      </>
    );
  }

  renderList() {
    const { loading, posList } = this.props;

    return (
      <DataWithLoader
        data={this.renderContent()}
        loading={loading}
        count={posList.lenth}
        emptyText="There is no pos"
        emptyIcon="folder-2"
        size="small"
      />
    );
  }

  render() {
    return (
      <Sidebar>
        <Section maxHeight={188} collapsible={PosList.length > 9}>
          {this.renderHeader()}
          {this.renderList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
