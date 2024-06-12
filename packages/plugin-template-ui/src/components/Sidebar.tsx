import React, { useState } from 'react'
import Box from "@erxes/ui/src/components/Box";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import { Transition } from '@headlessui/react';
import { RightDrawerContainer } from '../../../ui-template/src/styles';
import Form from '../containers/category/Form';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import Button from "@erxes/ui/src/components/Button";
import { router } from '@erxes/ui/src/utils';

type Props = {
    location: any;
    navigate: any;
    queryParams?: any;

    templateTypes: any

    categories: any[]
    removeCategory(_id: string): void
}

const Sidebar = (props: Props) => {

    const { queryParams, navigate, location, templateTypes, categories, removeCategory } = props

    const [toggleDrawer, setToggleDrawer] = useState<boolean>(false)
    const [currentType, setCurrentType] = useState(null)
    const [currentCategory, setCurrentCategory] = useState(null)
    const [categoryIds, setCategoryIds] = useState<string[]>(queryParams.categoryIds || []);

    const closeDrawer = () => {
        setToggleDrawer(false)
        setCurrentType(null)
        setCurrentCategory(null)
    }

    const renderEditAction = (category: any) => {
        return (
            <Button
                btnStyle="link"
                onClick={() => {
                    setCurrentCategory(category);
                    setToggleDrawer(!toggleDrawer);
                    setCurrentType(category?.contentType)
                }}
            >
                <Tip text={"Edit"} placement="bottom">
                    <Icon icon="edit" />
                </Tip>
            </Button>
        );
    };

    const renderRemoveAction = (category: any) => {
        return (
            <Button
                btnStyle="link"
                onClick={() => removeCategory(category._id)}
            >
                <Tip text={"Remove"} placement="bottom">
                    <Icon icon="times-circle" />
                </Tip>
            </Button>
        );
    };

    const handleClick = (type) => {
        if (!type) {
            return
        }

        const isCurrentTypeSelected: boolean = currentType === type;

        if (!isCurrentTypeSelected) {
            setCurrentType(type)
        }

        setToggleDrawer(isCurrentTypeSelected ? !toggleDrawer : true)
    }

    const handleClickAction = (categoryId: string) => {
        setCategoryIds(prevCategoryIds => {
            const newCategoryIds = [...prevCategoryIds];

            if (newCategoryIds.includes(categoryId)) {
                newCategoryIds.splice(newCategoryIds.indexOf(categoryId), 1);
            } else {
                newCategoryIds.push(categoryId);
            }

            router.removeParams(navigate, location, "page");
            router.setParams(navigate, location, { categoryIds: newCategoryIds });

            return newCategoryIds;
        });
    };

    const handleTypeFilter = (type) => {

        if (queryParams.contentType) {
            router.removeParams(navigate, location, "type");
        } else {
            router.removeParams(navigate, location, "page");
            router.setParams(navigate, location, { contentType: type });
        }
    }

    const renderCategories = (type) => {

        const items = categories.filter(category => category.contentType === type)

        return (
            <SidebarList>
                <CollapsibleList
                    items={items}
                    queryParams={queryParams}
                    keyCount="templateCount"
                    icon="chart-pie"
                    treeView={true}
                    editAction={renderEditAction}
                    removeAction={renderRemoveAction}
                    onClick={handleClickAction}
                />
            </SidebarList>
        )
    }

    const renderTypes = (templateType) => {

        const { type, description } = templateType

        const extraButtons = (
            <>
                <a
                    onClick={() => handleTypeFilter(type)}
                >
                    <Icon icon="filter-1" />
                </a>
                <a
                    onClick={() => handleClick(type)}
                >
                    <Icon icon="cog" />
                </a>
            </>
        )

        return (
            <Box
                key={type}
                title={description}
                extraButtons={extraButtons}
            >
                {renderCategories(type)}
            </Box>
        )
    }

    const renderContent = () => {
        return (templateTypes || []).map(renderTypes)
    }

    return (
        <>
            <Wrapper.Sidebar hasBorder={true}> {renderContent()} </Wrapper.Sidebar>

            <Transition
                show={toggleDrawer}
                className="slide-in-right"
                enter="transition duration-300"
            >
                <RightDrawerContainer>
                    <Form
                        type={currentType}
                        category={currentCategory}
                        categories={categories}
                        closeDrawer={closeDrawer}
                    />
                </RightDrawerContainer>

            </Transition>
        </>
    )
}

export default Sidebar