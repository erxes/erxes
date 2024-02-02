import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Icon from '@erxes/ui/src/components/Icon';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { icons } from '../../icons.constant';
import { ICategory, ITopic } from '@erxes/ui-knowledgebase/src/types';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  currentTopicId: string;
  category: ICategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  topics: ITopic[];
  queryParams: any;
};

const CategoryForm = (props: Props) => {
  const {
    category,
    currentTopicId,
    topics,
    queryParams,
    closeModal,
    renderButton,
  } = props;

  const [selectedIcon, setSelectedIcon] = useState<string>(
    category ? category.icon : '',
  );
  const [topicId, setTopicId] = useState<string>(currentTopicId);
  const [parentCategoryId, setParentCategoryId] = useState<string>(
    category && category.parentCategoryId!,
  );

  const generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
  }) => {
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        description: finalValues.description,
        icon: selectedIcon,
        topicIds: [topicId],
        topicId,
        parentCategoryId,
      },
    };
  };

  const generateOptions = (values: any, selectable?: boolean) => {
    const options = selectable
      ? [
          {
            value: null,
            label: 'Select category',
          },
        ]
      : [];

    values.forEach((option) =>
      options.push({
        value: option._id,
        label: option.title,
      }),
    );

    return options;
  };

  const handleIconChange = (obj) => {
    setSelectedIcon(obj ? obj.value : '');
  };

  const renderOption = (option) => {
    return (
      <div className="icon-option">
        <Icon icon={option.value} />
        {option.label}
      </div>
    );
  };

  const renderTopics = () => {
    const onChange = (selectedTopic) => {
      setTopicId(selectedTopic.value);
      setParentCategoryId('');
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the knowledgebase</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose knowledgebase')}
          value={topicId}
          options={generateOptions(topics)}
          onChange={onChange}
        />
      </FormGroup>
    );
  };

  const renderParentCategories = () => {
    const topic = topics.find((t) => t._id === topicId);
    let categories = topic ? topic.parentCategories : [];
    const isCurrentCategory = categories.find(
      (cat) => cat._id === queryParams.id,
    );

    if (category && currentTopicId === topicId) {
      categories = categories.filter((cat) => cat._id !== category._id);
    }

    if (!parentCategoryId && isCurrentCategory) {
      setParentCategoryId(queryParams.id);
    }

    const onChange = (selectedCategory) => {
      setParentCategoryId(selectedCategory.value);
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the parent category</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose category')}
          value={parentCategoryId}
          options={generateOptions(categories, true)}
          onChange={onChange}
          clearable={false}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const object = category || ({} as ICategory);
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Icon</ControlLabel>
          <Select
            required={true}
            value={selectedIcon}
            options={icons}
            onChange={handleIconChange}
            optionRenderer={renderOption}
            valueRenderer={renderOption}
          />
        </FormGroup>

        {renderTopics()}
        {renderParentCategories()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'category',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: category,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CategoryForm;
