import {
  KnowledgeBaseRow,
  RowActions,
  SectionHead,
  SectionTitle,
} from "./styles";

import CategoryForm from "../../containers/category/CategoryForm";
import CategoryList from "../../containers/category/CategoryList";
import { DropIcon } from "@erxes/ui/src/styles/main";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { ITopic } from "@erxes/ui-knowledgebase/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import KnowledgeForm from "../../containers/knowledge/KnowledgeForm";
import React from "react";
import { __ } from "@erxes/ui/src/utils/core";
import SaveTemplate from "@erxes/ui-template/src/components/SaveTemplate";

type Props = {
  queryParams: any;
  currentCategoryId: string;
  topic: ITopic;
  articlesCount: number;
  remove: (knowledgeBaseId: string) => void;
  refetchTopics: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  detailed: boolean;
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

class KnowledgeRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { detailed: collapse(props.topic._id) };
  }

  toggle = () => {
    const { topic } = this.props;

    this.setState({ detailed: collapse(topic._id, true) });
  };

  componentWillReceiveProps(nextProps) {
    const { categories } = this.props.topic;

    if (categories.includes(nextProps.currentCategoryId)) {
      this.setState({ detailed: collapse("", false, true) });
    }
  }

  renderTemplateModal() {
    const { topic } = this.props;
    const {
      brand,
      categories,
      createdBy,
      createdDate,
      modifiedBy,
      modifiedDate,
      parentCategories,
      ...topicContent
    } = topic

    const content = {
      content: JSON.stringify(topicContent),
      contentType: 'topic',
      serviceName: 'knowledgebase'
    };

    return <SaveTemplate as="menuItem" {...content} />;
  }

  renderManage() {
    const { topic, renderButton, remove, refetchTopics, queryParams } =
      this.props;

    const addCategory = <a>{__("Add category")}</a>;
    const manageTopic = <a>{__("Edit Knowledge Base")}</a>;

    const kbContent = (props) => (
      <KnowledgeForm
        {...props}
        renderButton={renderButton}
        topic={topic}
        remove={remove}
      />
    );

    const categoryContent = (props) => (
      <CategoryForm
        {...props}
        queryParams={queryParams}
        topicId={topic._id}
        refetchTopics={refetchTopics}
      />
    );

    const menuItems = [
      {
        title: "Manage Knowledge Base",
        trigger: manageTopic,
        content: kbContent,
        additionalModalProps: { enforceFocus: false, size: "lg" },
      },
      {
        title: "Add Category",
        trigger: addCategory,
        content: categoryContent,
        additionalModalProps: { autoOpenKey: "showKBAddCategoryModal" },
      },
    ];

    return (
      <RowActions>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={<Icon icon="cog" size={15} />}
          modalMenuItems={menuItems}
        >
          {this.renderTemplateModal()}
        </Dropdown>
        <DropIcon onClick={this.toggle} $isOpen={this.state.detailed} />
      </RowActions>
    );
  }

  render() {
    const { topic, currentCategoryId, queryParams } = this.props;

    return (
      <KnowledgeBaseRow key={topic._id}>
        <SectionHead>
          <SectionTitle onClick={this.toggle}>
            {topic.title} ({topic.categories.length})
            <span>{topic.description}</span>
          </SectionTitle>
          {this.renderManage()}
        </SectionHead>
        {this.state.detailed && (
          <CategoryList
            currentCategoryId={currentCategoryId}
            topicId={topic._id}
            queryParams={queryParams}
          />
        )}
      </KnowledgeBaseRow>
    );
  }
}

export default KnowledgeRow;
