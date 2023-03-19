import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_FORUMS } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './Row';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { IQuiz } from '../../types';
import FormControl from '@erxes/ui/src/components/form/Control';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import QuizForm from '../../containers/quiz/QuizForm';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  quizzes: IQuiz[];
  loading?: boolean;
  remove?: (id: string, emptyBulk: () => void) => void;
  refetch?: () => void;
  history?: any;
  totalCount: any;
  emptyBulk: () => void;
  bulk: any[];
  isAllSelected: boolean;
  toggleBulk: (target: IQuiz, toAdd: boolean) => void;
  toggleAll: (targets: IQuiz[], containerId: string) => void;
};

class List extends React.Component<Props> {
  renderRow() {
    const { quizzes, remove, bulk, toggleBulk, emptyBulk } = this.props;

    return quizzes.map(quiz => (
      <Row
        key={quiz._id}
        quiz={quiz}
        isChecked={bulk.includes(quiz)}
        toggleBulk={toggleBulk}
        remove={remove}
        history={history}
      />
    ));
  }

  renderForm = props => {
    return <QuizForm {...props} />;
  };

  render() {
    const {
      loading,
      totalCount,
      quizzes,
      isAllSelected,
      bulk,
      toggleAll,
      remove,
      emptyBulk
    } = this.props;

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () => {
        confirm('Are you sure? This cannot be undone.')
          .then(() => {
            bulk.map(item => remove(item._id, emptyBulk));
            Alert.success('You successfully deleted a quiz');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      };

      actionBarLeft = (
        <Button
          btnStyle="danger"
          size="small"
          icon="times-circle"
          onClick={onClick}
        >
          Delete
        </Button>
      );
    }

    const actionBarRight = (
      <ModalTrigger
        title="Create New Quiz"
        size="lg"
        trigger={
          <Button btnStyle="success" size="small" icon="plus-circle">
            Create New Quiz
          </Button>
        }
        content={this.renderForm}
      />
    );

    const onChange = () => {
      toggleAll(quizzes, 'quizzes');
    };

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>
              <SortHandler sortField={'name'} label={__('Name')} />
            </th>
            <th>{__('Description')}</th>
            <th>
              <SortHandler sortField={'company'} label={__('Company')} />
            </th>
            <th>{__('State')}</th>
            <th>{__('Category')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    const submenu = [
      { title: 'Posts', link: '/forums/posts' },
      { title: 'Pages', link: '/forums/pages' },
      { title: 'Quiz', link: '/forums/quizzes' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Quiz')} submenu={submenu} />}
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={quizzes.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_CONTENT_FORUMS}
                maxItemWidth="360px"
              />
            }
          />
        }
        hasBorder={true}
      />
    );
  }
}

export default List;
