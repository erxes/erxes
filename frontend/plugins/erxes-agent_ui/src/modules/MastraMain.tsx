import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const AgentsIndexPage = lazy(() =>
  import('~/pages/agents/AgentsIndexPage').then((m) => ({ default: m.AgentsIndexPage })),
);

const AgentFormPage = lazy(() =>
  import('~/pages/agents/AgentFormPage').then((m) => ({ default: m.AgentFormPage })),
);

const ChatPage = lazy(() =>
  import('~/pages/chat/ChatPage').then((m) => ({ default: m.ChatPage })),
);

const MastraMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:agentId" element={<ChatPage />} />
        <Route path="/agents" element={<AgentsIndexPage />} />
        <Route path="/agents/new" element={<AgentFormPage />} />
        <Route path="/agents/edit/:id" element={<AgentFormPage />} />
      </Routes>
    </Suspense>
  );
};

export default MastraMain;
