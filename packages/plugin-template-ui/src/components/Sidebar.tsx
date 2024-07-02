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
import { ITemplateCategory } from '@erxes/ui-template/src/types';

type Props = {
    location: any;
    navigate: any;
    queryParams?: any;

    templateTypes: any

    categories: ITemplateCategory[]
    removeCategory(_id: string): void
}

const Sidebar = (props: Props) => {

    const { queryParams, navigate, location, templateTypes, categories, removeCategory } = props

    const [toggleDrawer, setToggleDrawer] = useState<boolean>(false)
    const [currentType, setCurrentType] = useState<string | null>(null)
    const [currentCategory, setCurrentCategory] = useState<ITemplateCategory | null>(null)

    const closeDrawer = () => {
        setToggleDrawer(false)
        setCurrentType(null)
        setCurrentCategory(null)
    }

    const renderEditAction = (category: ITemplateCategory) => {
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

    const renderRemoveAction = (category: ITemplateCategory) => {
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

    const handleClick = (type: string) => {
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
        const { categoryIds } = queryParams

        router.removeParams(navigate, location, "page");

        if (Array.isArray(categoryIds) && categoryIds.includes(categoryId)) {

            const index = categoryIds.indexOf(categoryId)

            index > -1 && categoryIds.splice(index, 1)

            return router.setParams(navigate, location, { categoryIds });
        }

        if (Array.isArray(categoryIds) && !categoryIds.includes(categoryId)) {
            return router.setParams(navigate, location, { categoryIds: [...categoryIds, categoryId] });
        }

        if (categoryId === categoryIds) {
            return router.removeParams(navigate, location, "categoryIds")
        }

        if (categoryId !== categoryIds) {
            return router.setParams(navigate, location, { categoryIds: [categoryIds, categoryId] })
        }

        router.setParams(navigate, location, { categoryIds: categoryId })
    };

    const handleTypeFilter = (type: string) => {

        if (queryParams.contentType) {
            return router.removeParams(navigate, location, "contentType");
        }

        router.removeParams(navigate, location, "page");
        router.removeParams(navigate, location, "categoryIds");
        router.setParams(navigate, location, { contentType: type });

    }

    const renderCategories = (type: string) => {

        const items = categories.filter(category => category.contentType === type)

        return (
            <SidebarList>
                <CollapsibleList
                    items={items}
                    queryParams={queryParams}
                    queryParamName='categoryIds'
                    keyCount="templateCount"
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
                    <Icon icon="plus-1" />
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
                        category={currentCategory!}
                        categories={categories}
                        closeDrawer={closeDrawer}
                    />
                </RightDrawerContainer>

            </Transition>
        </>
    )
}

export default Sidebar