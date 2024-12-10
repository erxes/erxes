import React, { useRef, useState } from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import { __, Alert, router } from '@erxes/ui/src/utils';
import {
  FilterContainer,
  FlexItem,
  FlexRow,
  InputBar,
} from '@erxes/ui-settings/src/styles';
import Sidebar from '../containers/Sidebar';

import {
  Templates,
  TemplateBox,
  TemplateTitle,
  TemplateHeader,
  TemplateActions,
  TemplateDescription,
  Categories,
  CategoryItem,
  RightDrawerContainer,
  ImportInput,
  ImportLabel,
} from '@erxes/ui-template/src/styles';
import { Transition } from '@headlessui/react';
import Form from '@erxes/ui-template/src/containers/Form';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from '@erxes/ui/src/components/Dropdown';
import xss from 'xss';
import { getEnv } from '@erxes/ui/src/utils/index';
import queryString from 'query-string';
import { includesAny } from '@erxes/ui-template/src/utils';
import { ITemplate } from '@erxes/ui-template/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  location: any;
  navigate: any;
  queryParams?: any;

  templates: ITemplate[];
  totalCount: number;
  loading: boolean;
  removeTemplate: (id: string) => void;
  useTemplate: (id: string) => void;
  refetch: () => void;
};

const List = (props: Props) => {
  const {
    queryParams,
    location,
    navigate,
    templates,
    totalCount,
    loading,
    removeTemplate,
    useTemplate,
    refetch,
  } = props;

  const timerRef = useRef<number | null>(null);
  const [toggleSidebar, setToggleSidebar] = useState<boolean>(false);
  const [toggleDrawer, setToggleDrawer] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>(
    queryParams.searchValue || ''
  );
  const [template, setTemplate] = useState<ITemplate | null>(null);
  const [mode, setMode] = useState<string>('view');

  const isActive = (categoryId: string) => {
    const { categoryIds } = queryParams;

    if (Array.isArray(categoryIds)) {
      return categoryIds.includes(categoryId);
    }

    return queryParams.categoryIds === categoryId;
  };

  const closeDrawer = () => {
    setToggleDrawer(false);
    setTemplate(null);
  };

  const handleEdit = (currentTemplate: ITemplate) => {
    setMode('edit');
    setTemplate(currentTemplate);
    setToggleDrawer(true);
  };

  const handleSearch = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const inputValue = e.target.value;
    setSearchValue(inputValue);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, 'page');
      router.setParams(navigate, location, { searchValue: inputValue });
    }, 500);
  };

  const handleClick = (currentTemplate: ITemplate) => {
    if (!currentTemplate) {
      return;
    }

    const isCurrentTemplateSelected: boolean =
      (template || ({} as any))._id === currentTemplate._id;

    if (!isCurrentTemplateSelected) {
      setTemplate(currentTemplate);
    }

    setMode('view');
    setToggleDrawer(isCurrentTemplateSelected ? !toggleDrawer : true);
  };

  const handleCategoryClick = (e: any, categoryId: string) => {
    const { categoryIds } = queryParams;

    e.stopPropagation();

    router.removeParams(navigate, location, 'page');

    if (Array.isArray(categoryIds) && categoryIds.includes(categoryId)) {
      const index = categoryIds.indexOf(categoryId);

      index > -1 && categoryIds.splice(index, 1);

      return router.setParams(navigate, location, { categoryIds });
    }

    if (Array.isArray(categoryIds) && !categoryIds.includes(categoryId)) {
      return router.setParams(navigate, location, {
        categoryIds: [...categoryIds, categoryId],
      });
    }

    if (categoryId === categoryIds) {
      return router.removeParams(navigate, location, 'categoryIds');
    }

    if (categoryId !== categoryIds) {
      return router.setParams(navigate, location, {
        categoryIds: [categoryIds, categoryId],
      });
    }

    router.setParams(navigate, location, { categoryIds: categoryId });
  };

  const handleUse = (id: string) => {
    if (!id) {
      return;
    }

    useTemplate(id);
  };

  const handleInput = ({ target }) => {
    const file = target.files[0];

    const { REACT_APP_API_URL } = getEnv();
    const fileInfo = { name: file.name, size: file.size, type: file.type };

    if (fileInfo.size > 15 * 1024 * 1024) {
      Alert.warning(
        `Your file ${fileInfo.name} size is too large. Upload files less than 15MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader?.result?.toString() ?? '';

      try {
        const jsonData = JSON.parse(fileContent);
        fetch(`${REACT_APP_API_URL}/pl:template/file-import`, {
          method: 'POST',
          body: JSON.stringify(jsonData),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              refetch();
              Alert.success('Uploaded successfully');
            } else {
              Alert.error('Upload failed');
            }
          })
          .catch(err => {
            Alert.error(`Upload failed: ${err.message}`);
          });
      } catch (error) {
        Alert.error('Failed to parse JSON file');
      }
    };

    reader.onerror = () => {
      Alert.error('Failed to read the file');
    };

    reader.readAsText(file);
  };

  const handleExport = (currentTemplate: ITemplate) => {
    const { REACT_APP_API_URL } = getEnv();

    const stringified = queryString.stringify({
      _id: currentTemplate._id,
    });

    window.open(`${REACT_APP_API_URL}/pl:template/file-export?${stringified}`);
  };

  const renderHeader = () => {
    const { contentType } = queryParams;

    const filterTitle = (contentType || '')?.split(':')?.[1];

    const breadcrumb = [{ title: 'Templates' }];

    return (
      <Wrapper.Header
        title={'Templates'}
        breadcrumb={breadcrumb}
        queryParams={queryParams}
        filterTitle={filterTitle}
      />
    );
  };

  const renderActions = (template: ITemplate) => {
    const { contentType } = template;

    const [serviceName] = contentType.split(':');

    const items = [
      {
        icon: 'repeat',
        label: 'Use',
        action: data => handleUse(data?._id),
        isActive: !!isEnabled(serviceName),
        tooltip: `${serviceName} is not enabled`,
      },
      {
        icon: 'upload-6',
        label: 'Export',
        action: data => handleExport(data),
      },
      {
        icon: 'edit',
        label: 'Edit',
        action: data => handleEdit(data),
      },
      {
        icon: 'trash',
        label: 'Remove',
        action: data => removeTemplate(data?._id),
      },
    ];

    return (
      <TemplateActions>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={<Icon icon="ellipsis-v" />}
        >
          {items.map((item, index) => {
            const { icon, label, action, isActive = true } = item;

            return (
              <li key={index}>
                <a
                  onClick={() => {
                    if (!isActive) return;
                    action(template);
                  }}
                  style={{ cursor: isActive ? 'pointer' : 'not-allowed' }}
                >
                  <Icon icon={icon} /> {__(label)}
                </a>
              </li>
            );
          })}
        </Dropdown>
      </TemplateActions>
    );
  };

  const renderActionBar = () => {
    const actionBarLeft = (
      <Icon
        icon="subject"
        onClick={() => setToggleSidebar(!toggleSidebar)}
        style={{ cursor: 'pointer' }}
      />
    );

    const actionBarRight = (
      <FilterContainer>
        <FlexRow>
          <ImportInput
            id="import"
            type="file"
            onChange={handleInput}
            multiple={false}
            accept="application/JSON"
          />
          <ImportLabel htmlFor="import">
            <Icon icon="import" size={21} />
          </ImportLabel>
          <InputBar type="searchBar">
            <Icon icon="search-1" size={20} />
            <FlexItem>
              <FormControl
                placeholder={'Search'}
                name="searchValue"
                onChange={handleSearch}
                value={searchValue}
                autoFocus={true}
              />
            </FlexItem>
          </InputBar>
        </FlexRow>
      </FilterContainer>
    );

    return <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />;
  };

  const renderSidebar = () => {
    return (
      <Sidebar
        queryParams={queryParams}
        location={location}
        navigate={navigate}
        toggleSidebar={toggleSidebar}
      />
    );
  };

  const renderCategories = (template: ITemplate) => {
    const { categoryIds } = queryParams;
    const { categories } = template;
    const displayedCategories = categories.slice(0, 3);
    const hasMoreCategories = categories.length > 3;

    const remainingCategoryIds = categories
      .filter(category => !displayedCategories.includes(category))
      .map(category => category._id);
    const isMoreActive = includesAny(remainingCategoryIds, categoryIds);

    return (
      <Categories>
        {displayedCategories.map(category => (
          <CategoryItem
            key={category._id}
            isActive={isActive(category._id)}
            onClick={e => handleCategoryClick(e, category._id)}
          >
            {category.name}
          </CategoryItem>
        ))}
        {hasMoreCategories && (
          <CategoryItem
            key="more"
            isActive={isMoreActive}
            onClick={() => handleClick(template)}
          >
            ...
          </CategoryItem>
        )}
      </Categories>
    );
  };

  const renderTemplate = (template: ITemplate) => {
    return (
      <TemplateBox key={template._id} onClick={() => handleClick(template)}>
        <div>
          <TemplateHeader>
            <TemplateTitle>{template?.name}</TemplateTitle>
            {renderActions(template)}
          </TemplateHeader>
          <TemplateDescription
            limit={3}
            dangerouslySetInnerHTML={{ __html: xss(template?.description) }}
          />
        </div>
        {renderCategories(template)}
      </TemplateBox>
    );
  };

  const renderTemplates = () => {
    return (
      <Templates isSidebarOpen={toggleSidebar}>
        {(templates || []).map(renderTemplate)}
      </Templates>
    );
  };

  const renderContent = () => {
    return (
      <DataWithLoader
        data={renderTemplates()}
        loading={loading}
        count={totalCount}
        emptyText={'There is no template'}
        emptyImage="/images/actions/8.svg"
      />
    );
  };

  return (
    <>
      <Wrapper
        hasBorder={true}
        header={renderHeader()}
        actionBar={renderActionBar()}
        leftSidebar={renderSidebar()}
        content={renderContent()}
        footer={<Pagination count={totalCount || 0} />}
      />

      <Transition
        show={toggleDrawer}
        className="slide-in-right"
        enter="transition duration-300"
      >
        <RightDrawerContainer>
          <Form mode={mode} template={template} closeDrawer={closeDrawer} />
        </RightDrawerContainer>
      </Transition>
    </>
  );
};

export default List;
