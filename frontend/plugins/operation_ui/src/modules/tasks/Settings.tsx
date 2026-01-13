// import { Suspense } from 'react';
// import { Routes, Route } from 'react-router';
// import { SettingsHeader } from 'ui-modules';
// import { Button, PageContainer } from 'erxes-ui';
// import { IconChecklist } from '@tabler/icons-react';
// import { Outlet } from 'react-router-dom';
// import { TasksTagsPage } from '~/pages/TasksTagsPage';
// import { TagProvider, TagsGroupsAddButtons } from 'ui-modules';

import { TagsPageTemplate } from 'ui-modules';

// const TasksSettings = () => {
//   return (
//     <Suspense fallback={<div />}>
//       <TagProvider>
//         <Routes>
//           <Route
//             element={
//               <PageContainer>
//                 <SettingsHeader
//                   breadcrumbs={
//                     <Button variant="ghost" className="font-semibold">
//                       <IconChecklist className="w-4 h-4 text-accent-foreground" />
//                       Tasks
//                     </Button>
//                   }
//                 >
//                   <div className="ml-auto">
//                     <TagsGroupsAddButtons />
//                   </div>
//                 </SettingsHeader>
//                 <Outlet />
//               </PageContainer>
//             }
//           >
//             <Route path="/" element={<TasksTagsPage />} />
//           </Route>
//         </Routes>
//       </TagProvider>
//     </Suspense>
//   );
// };

// export default TasksSettings;

const TasksSettings = () => {
  return <TagsPageTemplate type="operation:task" title="Task tags" />;
};

export default TasksSettings;
