import {
  FieldStyle,
  SidebarList,
  Box,
  FormControl,
  DataWithLoader
} from '@erxes/ui/src';
import { __, router } from 'coreui/utils';
import React from 'react';
import { CustomPadding } from '@erxes/ui-contacts/src/customers/styles';

type Props = {
  history: any;
  queryParams: any;
};

// module names are saved exactly as these values in backend
// consider both ends when changing
const moduleOptions = [
  // cards service items
  { value: 'cards:board', label: 'Boards' },
  { value: 'cards:dealBoards', label: 'Deal boards' },
  { value: 'cards:purchaseBoards', label: 'Purchase boards' },
  { value: 'cards:taskBoards', label: 'Task boards' },
  { value: 'cards:ticketBoards', label: 'Ticket boards' },
  { value: 'cards:growthHackBoards', label: 'Growth hack boards' },
  { value: 'cards:dealPipelines', label: 'Deal pipelines' },
  { value: 'cards:purchasePipelines', label: 'Purchase pipelines' },
  { value: 'cards:taskPipelines', label: 'Task pipelines' },
  { value: 'cards:ticketPipelines', label: 'Ticket pipelines' },
  { value: 'cards:growthHackPipelines', label: 'Growth hack pipelines' },
  { value: 'cards:checklist', label: 'Checklists' },
  { value: 'cards:checkListItem', label: 'Checklist items' },
  { value: 'cards:deal', label: 'Deals' },
  { value: 'cards:purchase', label: 'Purchases' },
  { value: 'cards:task', label: 'Tasks' },
  { value: 'cards:ticket', label: 'Tickets' },
  { value: 'cards:pipelineLabel', label: 'Pipeline labels' },
  { value: 'cards:pipelineTemplate', label: 'Pipeline templates' },
  { value: 'cards:growthHack', label: 'Growth hacks' },
  { value: 'cards:dealStages', label: 'Deal stages' },
  { value: 'cards:purchaseStages', label: 'Purchase stages' },
  { value: 'cards:taskStages', label: 'Task stages' },
  { value: 'cards:ticketStages', label: 'Ticket stages' },
  { value: 'cards:growthHackStages', label: 'Growth hack stages' },
  // core-api service items
  { value: 'core:brand', label: 'Brands' },
  { value: 'core:permission', label: 'Permissions' },
  { value: 'core:user', label: 'Users' },
  { value: 'core:userGroup', label: 'User groups' },
  { value: 'core:config', label: 'Config' },
  // inbox service items
  { value: 'inbox:integration', label: 'Integrations' },
  { value: 'inbox:channel', label: 'Channels' },
  // contacts service items
  { value: 'contacts:company', label: 'Companies' },
  { value: 'contacts:customer', label: 'Customers' },
  // products service items
  { value: 'products:product', label: 'Products' },
  { value: 'products:product-category', label: 'Product categories' },
  // knowledgebase service items
  { value: 'knowledgebase:knowledgeBaseTopic', label: 'Knowledgebase topics' },
  {
    value: 'knowledgebase:knowledgeBaseCategory',
    label: 'Knowledgebase categories'
  },
  {
    value: 'knowledgebase:knowledgeBaseArticle',
    label: 'Knowledgebase articles'
  },
  // others
  { value: 'engages:engage', label: 'Campaigns' },
  { value: 'internalnotes:internalNote', label: 'Internal notes' },
  { value: 'tags:tag', label: 'Tags' },
  { value: 'segments:segment', label: 'Segments' },
  { value: 'responseTemplate', label: 'Response templates' },
  { value: 'emailTemplate', label: 'Email templates' },
  { value: 'importHistory', label: 'Import histories' },
  { value: 'script', label: 'Scripts' },
  { value: 'pricing:pricingPlan', label: 'PricingPlan' }
];

function ModuleFilter({ history, queryParams }: Props) {
  const timerRef = React.useRef<number | null>(null);
  const [searchValue, setSearchValue] = React.useState('');
  const [modules, setModules] = React.useState(moduleOptions);

  React.useEffect(() => {
    if (!queryParams.type) {
      resetFilter();
    }

    if (queryParams.searchModule) {
      setSearchValue(queryParams.searchModule);
      applyModuleFilter(queryParams.searchModule);
    }
  }, [queryParams.type, queryParams.searchModule]);

  const resetFilter = () => {
    setSearchValue('');
    setModules(moduleOptions);
  };

  const applyModuleFilter = (value: string) => {
    setSearchValue(value);
    const filteredModules = moduleOptions.filter(module =>
      module.label.toLowerCase().includes(value.toLowerCase())
    );
    setModules(filteredModules);
  };

  const onClick = (module: { value: string; label: string }) => {
    router.setParams(history, { type: module.value });
    router.removeParams(history, 'page');
  };

  const searchModule = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const inputValue = e.target.value;
    setSearchValue(inputValue);
    applyModuleFilter(inputValue);

    timerRef.current = window.setTimeout(() => {
      router.setParams(history, { searchModule: inputValue });
    }, 500);
  };

  const renderModule = (module: { value: string; label: string }) => (
    <li key={module.value}>
      <a
        href="#filter"
        tabIndex={0}
        className={queryParams.type === module.value ? 'active' : ''}
        onClick={() => onClick(module)}
      >
        <FieldStyle>{module.label}</FieldStyle>
      </a>
    </li>
  );

  const data = (
    <SidebarList style={{ paddingBottom: '10px' }}>
      {modules.map(renderModule)}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by Module')}
      collapsible={modules.length > 5}
      name="showFilterByModule"
      isOpen={queryParams.type}
    >
      <CustomPadding>
        <FormControl
          type="text"
          onChange={searchModule}
          placeholder={__('Type to search')}
          value={searchValue}
        />
      </CustomPadding>
      <DataWithLoader
        data={data}
        loading={false}
        count={modules.length}
        emptyText={'There is no Module'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default ModuleFilter;
