import React, { useRef, useState } from 'react'
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import FormControl from '@erxes/ui/src/components/form/Control'
import Icon from '@erxes/ui/src/components/Icon';
import { Alert, router, uploadHandler } from '@erxes/ui/src/utils'
import { FilterContainer, FlexItem, FlexRow, InputBar } from "@erxes/ui-settings/src/styles";
import Sidebar from '../containers/Sidebar';

import { Templates, TemplateBox, TemplateTitle, TemplateHeader, TemplateActions, TemplateDescription, Categories, CategoryItem, RightDrawerContainer, UploadInput } from '../../../ui-template/src/styles';
import { Transition } from '@headlessui/react';
import Form from '@erxes/ui-template/src/containers/Form';
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Dropdown from '@erxes/ui/src/components/Dropdown';
import xss from "xss";
import { getEnv } from "@erxes/ui/src/utils/index";
import queryString from 'query-string';
import Uploader from "@erxes/ui/src/components/Uploader";

type Props = {
    location: any;
    navigate: any;
    queryParams?: any;

    templates: any
    totalCount: number;
    loading: boolean;
    removeTemplate: (id: string) => void;
    useTemplate: (template: any) => void
};

const List = (props: Props) => {

    const { queryParams, location, navigate, templates, totalCount, loading, removeTemplate, useTemplate } = props;

    const timerRef = useRef<number | null>(null)
    const [toggleSidebar, setToggleSidebar] = useState(false)
    const [toggleDrawer, setToggleDrawer] = useState(false)

    const [searchValue, setSearchValue] = useState(queryParams.searchValue || '')
    const [template, setTemplate] = useState(null)
    const [mode, setMode] = useState('view')

    const closeDrawer = () => {
        setToggleDrawer(false)
        setTemplate(null)
    }

    const handleEdit = (currentTemplate: any) => {
        setMode('edit')
        setTemplate(currentTemplate)
        setToggleDrawer(true);
    }

    const handleSearch = (e) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const inputValue = e.target.value;
        setSearchValue(inputValue)

        timerRef.current = window.setTimeout(() => {
            router.removeParams(navigate, location, "page");
            router.setParams(navigate, location, { searchValue: inputValue });
        }, 500);
    };

    const handleClick = (currentTemplate) => {
        if (!currentTemplate) {
            return
        };

        const isCurrentTemplateSelected: boolean = (template || {} as any)._id === currentTemplate._id;

        if (!isCurrentTemplateSelected) {
            setTemplate(currentTemplate)
        }

        setMode('view')
        setToggleDrawer(isCurrentTemplateSelected ? !toggleDrawer : true);
    }

    const handleUse = (currentTemplate) => {
        if (!currentTemplate) {
            return
        }

        useTemplate(currentTemplate)
    }

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
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                }).then(response => {
                    console.log('response', response)
                    if (response.ok) {
                        console.log('JSON data uploaded successfully');
                    } else {
                        console.error('JSON data upload failed');
                    }
                }).catch(err => {
                    Alert.error(err.message);
                });
            } catch (error) {
                Alert.error('Failed to parse JSON file');
            }
        };
        reader.readAsText(file);

    };

    const handleExport = (currentTemplate) => {
        const { REACT_APP_API_URL } = getEnv()

        const stringified = queryString.stringify({
            ...currentTemplate
        })

        window.open(`${REACT_APP_API_URL}/pl:template/file-export?${stringified}`)
    }

    const renderHeader = () => {

        const breadcrumb = [
            { title: 'Templates' }
        ]

        return (
            <Wrapper.Header
                title={"Templates"}
                breadcrumb={breadcrumb}
                queryParams={queryParams}
            />
        )
    }

    const renderActions = (template) => {

        return (
            <TemplateActions>
                <Dropdown
                    as={DropdownToggle}
                    toggleComponent={<Icon icon="ellipsis-v" />}
                >
                    <li>
                        <a onClick={() => handleUse(template)}>
                            <Icon icon="repeat" /> Use
                        </a>
                    </li>
                    <li>
                        <a onClick={() => handleExport(template)}>
                            <Icon icon="upload-6" /> Export
                        </a>
                    </li>
                    <li>
                        <a onClick={() => handleEdit(template)}>
                            <Icon icon="edit" /> Edit
                        </a>
                    </li>
                    <li>
                        <a onClick={() => removeTemplate(template?._id)}>
                            <Icon icon="trash" /> Remove
                        </a>
                    </li>
                </Dropdown>
            </TemplateActions>
        )
    }

    const renderActionBar = () => {

        const actionBarLeft = (
            <Icon icon="subject" onClick={() => setToggleSidebar(!toggleSidebar)} />
        )

        const actionBarRight = (
            <FilterContainer>
                <FlexRow>
                    <input
                        type='file'
                        onChange={handleInput}
                        multiple={false}
                        accept="application/JSON"
                    />
                    {/* <Uploader
                    
                        icon='upload'
                        showOnlyIcon
                        hideUploadButtonOnLoad
                        onChange={handleUpload}
                        multiple={false}
                        single={true}
                    /> */}
                    <InputBar type="searchBar">
                        <Icon icon="search-1" size={20} />
                        <FlexItem>
                            <FormControl
                                placeholder={"Search"}
                                name="searchValue"
                                onChange={handleSearch}
                                value={searchValue}
                                autoFocus={true}
                            />
                        </FlexItem>
                    </InputBar>
                </FlexRow>
            </FilterContainer>
        )

        return (
            <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
        )
    }

    const renderSidebar = () => {

        if (!toggleSidebar) {
            return <></>
        }

        return <Sidebar queryParams={queryParams} location={location} navigate={navigate} />
    }

    const renderTemplate = (template) => {
        return (
            <TemplateBox key={template._id} onClick={() => handleClick(template)}>
                <div>
                    <TemplateHeader>
                        <TemplateTitle>{template?.name}</TemplateTitle>
                        {renderActions(template)}
                    </TemplateHeader>
                    <TemplateDescription limit={3} dangerouslySetInnerHTML={{ __html: xss(template?.description) }} />
                </div>
                <Categories>
                    {(template?.categories || []).map(
                        category => (<CategoryItem key={category._id}>{category.name}</CategoryItem>)
                    )}
                </Categories>
            </TemplateBox>
        )
    }

    const renderTemplates = () => {
        return (
            <Templates>{(templates || []).map(renderTemplate)}</Templates>
        )
    }

    const renderContent = () => {
        return (
            <DataWithLoader
                data={renderTemplates()}
                loading={loading}
                count={totalCount}
                emptyText={"There is no template"}
                emptyImage="/images/actions/8.svg"
            />
        )
    }

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
    )
}

export default List