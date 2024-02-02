import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { DropIcon } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import CategoryForm from '../../containers/category/CategoryForm';
import CategoryList from '../../containers/category/CategoryList';
import KnowledgeForm from '../../containers/knowledge/KnowledgeForm';
import { ITopic } from '@erxes/ui-knowledgebase/src/types';
import {
  KnowledgeBaseRow,
  RowActions,
  SectionHead,
  SectionTitle,
} from './styles';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  topic: ITopic;
  articlesCount: number;
  remove: (knowledgeBaseId: string) => void;
  refetchTopics: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const STORAGE_KEY = `erxes_knowledgebase_accordion`;

const collapse = (id: string, click?: boolean, isCurrent?: boolean) => {
  const data = localStorage.getItem(STORAGE_KEY);
  let values: string[] = [];

  if (data) {
    values = JSON.parse(data);
  }

  if (click) {
    values.includes(id)
      ? (values = values.filter((key) => key !== id))
      : values.push(id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }

  return isCurrent ? true : values.includes(id);
};

const KnowledgeRow = (props: Props) => {
  const {
    topic,
    currentCategoryId,
    queryParams,
    renderButton,
    remove,
    refetchTopics,
  } = props;

  const [detailed, setDetailed] = useState<boolean>(collapse(props.topic._id));

  useEffect(() => {
    const { categories } = topic;

    if (categories.some((category) => category._id === currentCategoryId)) {
      setDetailed(collapse('', false, true));
    }
  }, [currentCategoryId]);

  const handleToggle = () => {
    setDetailed(collapse(topic._id, true));
  };

  const content = (formProps) => (
    <KnowledgeForm
      {...formProps}
      renderButton={renderButton}
      topic={topic}
      remove={remove}
    />
  );

  const categoryContent = (formProps) => (
    <CategoryForm
      {...formProps}
      queryParams={queryParams}
      topicId={topic._id}
      refetchTopics={refetchTopics}
    />
  );

  const renderManage = () => {
    const addCategory = <Dropdown.Item>{__('Add category')}</Dropdown.Item>;

    const manageTopic = (
      <Dropdown.Item>{__('Edit Knowledge Base')}</Dropdown.Item>
    );

    return (
      <RowActions>
        <Dropdown alignRight={true} style={{ float: 'left' }}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-knowledgebase">
            <Icon icon="cog" size={15} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <ModalTrigger
              title="Manage Knowledge Base"
              trigger={manageTopic}
              content={content}
              enforceFocus={false}
              size="lg"
            />
            <ModalTrigger
              title="Add Category"
              trigger={addCategory}
              autoOpenKey="showKBAddCategoryModal"
              content={categoryContent}
            />
          </Dropdown.Menu>
        </Dropdown>
        <DropIcon onClick={handleToggle} isOpen={detailed} />
      </RowActions>
    );
  };

  return (
    <KnowledgeBaseRow key={topic._id}>
      <SectionHead>
        <SectionTitle onClick={handleToggle}>
          {topic.title} ({topic.categories.length})
          <span>{topic.description}</span>
        </SectionTitle>
        {renderManage()}
      </SectionHead>
      {detailed && (
        <CategoryList
          currentCategoryId={currentCategoryId}
          topicId={topic._id}
          queryParams={queryParams}
        />
      )}
    </KnowledgeBaseRow>
  );
};

export default KnowledgeRow;
