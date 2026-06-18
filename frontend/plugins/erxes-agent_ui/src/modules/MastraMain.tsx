import { lazy } from 'react';
import { Route } from 'react-router';
import { PluginRoutesShell } from '~/components/PluginRoutesShell';

const AgentsIndexPage = lazy(() =>
  import('~/pages/agents/AgentsIndexPage').then((m) => ({
    default: m.AgentsIndexPage,
  })),
);

const AgentFormPage = lazy(() =>
  import('~/pages/agents/AgentFormPage').then((m) => ({
    default: m.AgentFormPage,
  })),
);

const ChatPage = lazy(() =>
  import('~/modules/chat/ChatPage').then((m) => ({ default: m.ChatPage })),
);

const WorkflowsIndexPage = lazy(() =>
  import('~/pages/workflows/WorkflowsIndexPage').then((m) => ({
    default: m.WorkflowsIndexPage,
  })),
);

const WorkflowDetailPage = lazy(() =>
  import('~/pages/workflows/WorkflowDetailPage').then((m) => ({
    default: m.WorkflowDetailPage,
  })),
);

const WorkflowFormPage = lazy(() =>
  import('~/pages/workflows/WorkflowFormPage').then((m) => ({
    default: m.WorkflowFormPage,
  })),
);

const LearningsIndexPage = lazy(() =>
  import('~/pages/learnings/LearningsIndexPage').then((m) => ({
    default: m.LearningsIndexPage,
  })),
);

const SchedulesIndexPage = lazy(() =>
  import('~/pages/schedules/SchedulesIndexPage').then((m) => ({
    default: m.SchedulesIndexPage,
  })),
);

const ScheduleFormPage = lazy(() =>
  import('~/pages/schedules/ScheduleFormPage').then((m) => ({
    default: m.ScheduleFormPage,
  })),
);

const MastraMain = () => {
  return (
    <PluginRoutesShell defaultPath="chat">
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:agentId" element={<ChatPage />} />
      <Route path="/agents" element={<AgentsIndexPage />} />
      <Route path="/agents/new" element={<AgentFormPage />} />
      <Route path="/agents/edit/:id" element={<AgentFormPage />} />
      <Route path="/workflows" element={<WorkflowsIndexPage />} />
      <Route path="/workflows/new" element={<WorkflowFormPage />} />
      <Route path="/workflows/edit/:id" element={<WorkflowFormPage />} />
      <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
      <Route path="/learnings" element={<LearningsIndexPage />} />
      <Route path="/schedules" element={<SchedulesIndexPage />} />
      <Route path="/schedules/new" element={<ScheduleFormPage />} />
      <Route path="/schedules/edit/:id" element={<ScheduleFormPage />} />
    </PluginRoutesShell>
  );
};

export default MastraMain;
