import {
  FieldStyle,
  SidebarList,
  Box,
  FormControl,
  DataWithLoader
} from "@erxes/ui/src";
import { __, router } from "@erxes/ui/src/utils";
import React from "react";
import { CustomPadding } from "@erxes/ui-contacts/src/customers/styles";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: Record<string, string>;
};

// module names are saved exactly as these values in backend
// consider both ends when changing
const moduleOptions = [
  // cards service items
  { value: "sales:dealBoards", label: "Deal boards" },
  { value: "purchases:purchaseBoards", label: "Purchase boards" },
  { value: "tasks:taskBoards", label: "Task boards" },
  { value: "tickets:ticketBoards", label: "Ticket boards" },
  { value: "growthhacks:growthHackBoards", label: "Growth hack boards" },
  { value: "sales:dealPipelines", label: "Deal pipelines" },
  { value: "purchases:purchasePipelines", label: "Purchase pipelines" },
  { value: "tasks:taskPipelines", label: "Task pipelines" },
  { value: "tickets:ticketPipelines", label: "Ticket pipelines" },
  { value: "growthhacks:growthHackPipelines", label: "Growth hack pipelines" },
  { value: "sales:checklist", label: "Checklists" },
  { value: "growthhacks:growthHackheckListItem", label: "Checklist items" },
  { value: "sales:deal", label: "Deals" },
  { value: "purchases:purchase", label: "Purchases" },
  { value: "tasks:task", label: "Tasks" },
  { value: "tickets:ticket", label: "Tickets" },
  { value: "growthhacks:growthHackPipelineLabel", label: "Pipeline labels" },
  {
    value: "growthhacks:growthHackipelineTemplate",
    label: "Pipeline templates"
  },
  { value: "growthhacks:growthHack", label: "Growth hacks" },
  { value: "sales:dealStages", label: "Deal stages" },
  { value: "purchases:purchaseStages", label: "Purchase stages" },
  { value: "tasks:taskStages", label: "Task stages" },
  { value: "tickets:ticketStages", label: "Ticket stages" },
  { value: "growthhacks:growthHackstages", label: "Growth hack stages" },
  // core-api service items
  { value: "core:brand", label: "Brands" },
  { value: "core:permission", label: "Permissions" },
  { value: "core:user", label: "Users" },
  { value: "core:userGroup", label: "User groups" },
  { value: "core:config", label: "Config" },
  // inbox service items
  { value: "inbox:integration", label: "Integrations" },
  { value: "inbox:channel", label: "Channels" },
  // contacts service items
  { value: "core:company", label: "Companies" },
  { value: "core:customer", label: "Customers" },
  // products service items
  { value: "core:product", label: "Products" },
  { value: "core:product-category", label: "Product categories" },
  // knowledgebase service items
  { value: "knowledgebase:knowledgeBaseTopic", label: "Knowledgebase topics" },
  {
    value: "knowledgebase:knowledgeBaseCategory",
    label: "Knowledgebase categories"
  },
  {
    value: "knowledgebase:knowledgeBaseArticle",
    label: "Knowledgebase articles"
  },
  // others
  { value: "engages:engage", label: "Campaigns" },
  { value: "core:internalNote", label: "Internal notes" },
  { value: "core:tag", label: "Tags" },
  { value: "core:segment", label: "Segments" },
  { value: "responseTemplate", label: "Response templates" },
  { value: "emailTemplate", label: "Email templates" },
  { value: "importHistory", label: "Import histories" },
  { value: "script", label: "Scripts" },
  { value: "pricing:pricingPlan", label: "PricingPlan" }
];

function ModuleFilter({ queryParams }: Props) {
  const timerRef = React.useRef<number | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [modules, setModules] = React.useState(moduleOptions);
  const location = useLocation();
  const navigate = useNavigate();

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
    setSearchValue("");
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
    router.setParams(navigate, location, { type: module.value });
  };

  const searchModule = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const inputValue = e.target.value;
    setSearchValue(inputValue);
    applyModuleFilter(inputValue);

    timerRef.current = window.setTimeout(() => {
      router.setParams(navigate, location, { searchModule: inputValue });
    }, 500);
  };

  const renderModule = (module: { value: string; label: string }) => (
    <li key={module.value}>
      <a
        href="#filter"
        tabIndex={0}
        className={queryParams.type === module.value ? "active" : ""}
        onClick={() => onClick(module)}
      >
        <FieldStyle>{module.label}</FieldStyle>
      </a>
    </li>
  );

  const data = (
    <SidebarList style={{ paddingBottom: "10px" }}>
      {modules.map(renderModule)}
    </SidebarList>
  );

  return (
    <Box
      title={__("Filter by Module")}
      collapsible={modules.length > 5}
      name="showFilterByModule"
      isOpen={queryParams.type ? true : false}
    >
      <CustomPadding>
        <FormControl
          type="text"
          onChange={searchModule}
          placeholder={__("Type to search")}
          value={searchValue}
        />
      </CustomPadding>
      <DataWithLoader
        data={data}
        loading={false}
        count={modules.length}
        emptyText={"There is no Module"}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default ModuleFilter;
