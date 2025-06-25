import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Main Container - Better responsive handling
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

// Header - Improved mobile layout
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeaderTitle = styled.div`
  h1 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 800;
    color: white;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    margin: 0;
  }
`;

const LiveClock = styled.div`
  text-align: right;
  color: white;

  @media (max-width: 768px) {
    text-align: center;
  }

  .time {
    font-family: 'Courier New', monospace;
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .date {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 0.25rem;
  }
`;

// Status Cards - Better grid behavior
const StatusCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.8s ease-out;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
`;

const StatusCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-value {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 800;
    color: #1e293b;
    margin: 0.5rem 0 0 0;
  }

  .card-icon {
    font-size: 2rem;
    opacity: 0.6;
  }
`;

// Main Grid - Better responsive behavior
const MainGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  animation: ${fadeIn} 1s ease-out;

  /* Single column on mobile */
  grid-template-columns: 1fr;

  /* Two columns on larger screens */
  @media (min-width: 1200px) {
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
`;

// Agent Table - Improved scrolling and layout
const AgentTableContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;

  /* Prevent container from growing too tall */
  max-height: 600px;
  display: flex;
  flex-direction: column;
`;

const TableHeader = styled.div`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 1.5rem;
  flex-shrink: 0;

  h2 {
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const TableContainer = styled.div`
  overflow: auto;
  flex: 1;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const TableHeaderRow = styled.thead`
  background: rgba(248, 250, 252, 0.9);
  position: sticky;
  top: 0;
  z-index: 10;

  th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid rgba(226, 232, 240, 0.8);
    white-space: nowrap;
    background: rgba(248, 250, 252, 0.95);
    backdrop-filter: blur(5px);
  }
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  animation: ${slideIn} 0.3s ease-out;

  &:hover {
    background: rgba(248, 250, 252, 0.5);
  }

  td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(226, 232, 240, 0.3);
    vertical-align: middle;

    &:first-child {
      font-weight: 600;
    }
  }

  /* Alternate row colors for better readability */
  &:nth-child(even) {
    background: rgba(248, 250, 252, 0.2);
  }
`;

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = styled.span<StatusBadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;

  ${(props) => {
    switch (props.status) {
      case 'Idle':
        return css`
          background: rgba(34, 197, 94, 0.1);
          color: #166534;
          border-color: rgba(34, 197, 94, 0.2);
        `;
      case 'InUse':
        return css`
          background: rgba(59, 130, 246, 0.1);
          color: #1e40af;
          border-color: rgba(59, 130, 246, 0.2);
        `;
      case 'Ringing':
        return css`
          background: rgba(245, 158, 11, 0.1);
          color: #92400e;
          border-color: rgba(245, 158, 11, 0.2);
          animation: ${pulse} 2s infinite;
        `;
      case 'Paused':
        return css`
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-color: rgba(239, 68, 68, 0.2);
        `;
      case 'Unavailable':
        return css`
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border-color: rgba(107, 114, 128, 0.2);
        `;
      default:
        return css`
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border-color: rgba(107, 114, 128, 0.2);
        `;
    }
  }}
`;

const ExtensionCell = styled.span`
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
`;

const TimeCell = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #64748b;
`;

// Call Status - Better scrolling and compact layout
const CallStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  /* On mobile, we want these to stack properly */
  @media (max-width: 1199px) {
    margin-top: 1rem;
  }
`;

const CallStatusCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;

  /* Prevent cards from growing too tall */
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

interface CallStatusHeaderProps {
  gradient?: string;
}

const CallStatusHeader = styled.div<CallStatusHeaderProps>`
  padding: 1.25rem;
  background: ${(props) =>
    props.gradient || 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
  flex-shrink: 0;

  h3 {
    color: white;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CallStatusBody = styled.div`
  padding: 1.25rem;
  flex: 1;
  overflow: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
`;

const CallItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 250px;
  overflow-y: auto;

  /* Smooth scrolling */
  scroll-behavior: smooth;
`;

const CallItem = styled.div<any>`
  background: ${(props: any) => props.bgColor || 'rgba(245, 158, 11, 0.1)'};
  border: 1px solid
    ${(props: any) => props.borderColor || 'rgba(245, 158, 11, 0.2)'};
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  animation: ${slideIn} 0.3s ease-out;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CallItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const CallNumber = styled.span`
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* Truncate long numbers on small screens */
  @media (max-width: 480px) {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CallTime = styled.span<{ color?: string }>`
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 1rem;
  color: ${(props) => props.color || '#d97706'};
  white-space: nowrap;
`;

const CallDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 1rem;
    font-weight: 500;
  }
`;

// Compact status indicator for mobile
const CompactStatusIndicator = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;

    .status-item {
      text-align: center;
      color: white;

      .count {
        font-size: 1.5rem;
        font-weight: bold;
        display: block;
      }

      .label {
        font-size: 0.75rem;
        opacity: 0.8;
        text-transform: uppercase;
      }
    }
  }
`;

// Types and Interfaces
interface DashboardProps {
  waitingList?: string;
  proceedingList?: string;
  memberList?: string;
  initialTalkingCall?: string;
  initialWaitingCall?: string;
}

const parseApiData = (dataString) => {
  try {
    return typeof dataString === 'string' ? JSON.parse(dataString) : dataString;
  } catch (error) {
    console.error('Error parsing API data:', error);
    return { extension: '', member: [] };
  }
};

const formatWaitTime = (starttime: string): string => {
  if (!starttime) return '00:00';

  try {
    const start = new Date(starttime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
  } catch (error) {
    return '00:00';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Idle':
      return '🟢';
    case 'InUse':
      return '🔵';
    case 'Ringing':
      return '🟡';
    case 'Paused':
      return '🔴';
    case 'Unavailable':
      return '⚫';
    default:
      return '⚪';
  }
};

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '0 min';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatDate = (dateString) => {
  if (!dateString || dateString === '0000-00-00 00:00:00') return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Main Component
const EnhancedCallCenterDashboard: React.FC<DashboardProps> = ({
  waitingList,
  proceedingList,
  memberList,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const actualWaitingList = waitingList || [];
  const actualProceedingList = proceedingList || [];
  const actualMemberList = memberList || [];

  // Parse API data
  const parsedMemberData = useMemo(
    () => parseApiData(actualMemberList),
    [actualMemberList],
  );
  const parsedWaitingData = useMemo(
    () => parseApiData(actualWaitingList),
    [actualWaitingList],
  );
  const parsedProceedingData = useMemo(
    () => parseApiData(actualProceedingList),
    [actualProceedingList],
  );

  // Get member data
  const members = parsedMemberData.member || [];
  const waitingCalls = parsedWaitingData.member || [];
  const activeCalls = parsedProceedingData.member || [];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAgents = members.length;
    const idleAgents = members.filter((m) => m.status === 'Idle').length;
    const busyAgents = members.filter((m) => m.status === 'InUse').length;
    const pausedAgents = members.filter((m) => m.status === 'Paused').length;
    const unavailableAgents = members.filter(
      (m) => m.status === 'Unavailable',
    ).length;

    return {
      totalAgents,
      idleAgents,
      busyAgents,
      pausedAgents,
      unavailableAgents,
      activeCallsCount: busyAgents, // Use busy agents count for active calls
      waitingCallsCount: waitingCalls.length,
    };
  }, [members, waitingCalls]);

  // Sort agents by status priority
  const sortedAgents = useMemo(() => {
    const statusPriority = {
      Ringing: 1,
      InUse: 2,
      Idle: 3,
      Paused: 4,
      Unavailable: 5,
    };

    return [...members].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 6;
      const priorityB = statusPriority[b.status] || 6;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // Secondary sort by extension number
      return a.member_extension.localeCompare(b.member_extension);
    });
  }, [members]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <DashboardContainer>
      <Header>
        <HeaderTitle>
          <h1>Call Center Dashboard</h1>
          <p>Live monitoring and agent status</p>
        </HeaderTitle>
        <LiveClock>
          <div className="time">{currentTime.toLocaleTimeString()}</div>
          <div className="date">{currentTime.toLocaleDateString()}</div>
        </LiveClock>
      </Header>

      {/* Compact mobile status indicator */}
      <CompactStatusIndicator>
        <div className="status-item">
          <span className="count">{stats.totalAgents}</span>
          <span className="label">Agents</span>
        </div>
        <div className="status-item">
          <span className="count">{stats.idleAgents}</span>
          <span className="label">Available</span>
        </div>
        <div className="status-item">
          <span className="count">{stats.busyAgents}</span>
          <span className="label">Busy</span>
        </div>
        <div className="status-item">
          <span className="count">{stats.waitingCallsCount}</span>
          <span className="label">Waiting</span>
        </div>
      </CompactStatusIndicator>

      <StatusCardsGrid>
        <StatusCard>
          <div className="card-header">
            <div>
              <div className="card-title">Total Agents</div>
              <div className="card-value">{stats.totalAgents}</div>
            </div>
            <div className="card-icon">👥</div>
          </div>
        </StatusCard>

        <StatusCard>
          <div className="card-header">
            <div>
              <div className="card-title">Available</div>
              <div className="card-value">{stats.idleAgents}</div>
            </div>
            <div className="card-icon">✅</div>
          </div>
        </StatusCard>

        <StatusCard>
          <div className="card-header">
            <div>
              <div className="card-title">Active Calls</div>
              <div className="card-value">{stats.busyAgents}</div>
            </div>
            <div className="card-icon">📞</div>
          </div>
        </StatusCard>

        <StatusCard>
          <div className="card-header">
            <div>
              <div className="card-title">Waiting Calls</div>
              <div className="card-value">{stats.waitingCallsCount}</div>
            </div>
            <div className="card-icon">⏳</div>
          </div>
        </StatusCard>
      </StatusCardsGrid>

      <MainGrid>
        <AgentTableContainer>
          <TableHeader>
            <h2>👨‍💼 Agent Status ({members.length})</h2>
          </TableHeader>

          <TableContainer>
            <Table>
              <TableHeaderRow>
                <tr>
                  <th>Status</th>
                  <th>Extension</th>
                  <th>Name</th>
                  <th>Answered</th>
                  <th>Abandoned</th>
                  <th>Talk Time</th>
                  <th>Last Action</th>
                </tr>
              </TableHeaderRow>
              <tbody>
                {sortedAgents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      <EmptyState>
                        <div className="empty-icon">👨‍💼</div>
                        <div className="empty-text">No agents available</div>
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  sortedAgents.map((agent, index) => (
                    <TableRow key={agent.member_extension || index}>
                      <td>
                        <StatusBadge status={agent.status}>
                          <span>{getStatusIcon(agent.status)}</span>
                          {agent.status}
                        </StatusBadge>
                      </td>
                      <td>
                        <ExtensionCell>{agent.member_extension}</ExtensionCell>
                      </td>
                      <td>{agent.first_name}</td>
                      <td>{agent.answer || 0}</td>
                      <td>{agent.abandon || 0}</td>
                      <td>
                        <TimeCell>{formatTime(agent.talktime)}</TimeCell>
                      </td>
                      <td>
                        <TimeCell>{formatDate(agent.pausetime)}</TimeCell>
                      </td>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </TableContainer>
        </AgentTableContainer>

        <CallStatusContainer>
          {/* Waiting Calls */}
          <CallStatusCard>
            <CallStatusHeader gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <h3>⏳ Waiting Calls ({stats.waitingCallsCount})</h3>
            </CallStatusHeader>
            <CallStatusBody>
              {stats.waitingCallsCount === 0 ? (
                <EmptyState>
                  <div className="empty-icon">⏳</div>
                  <div className="empty-text">No waiting calls</div>
                </EmptyState>
              ) : (
                <CallItemsContainer>
                  {waitingCalls.map((call, index) => (
                    <CallItem
                      key={`waiting-${index}`}
                      bgColor="rgba(245, 158, 11, 0.1)"
                      borderColor="rgba(245, 158, 11, 0.2)"
                    >
                      <CallItemHeader>
                        <CallNumber>
                          📱 {call.callerid || `Call ${index + 1}`}
                        </CallNumber>
                        <CallTime color="#d97706">
                          {formatWaitTime(call.starttime) || '00:00'}
                        </CallTime>
                      </CallItemHeader>
                      <CallDetails>
                        <span>💭</span>
                        <span>Waiting in queue</span>
                      </CallDetails>
                    </CallItem>
                  ))}
                </CallItemsContainer>
              )}
            </CallStatusBody>
          </CallStatusCard>

          {/* Active Calls */}
          <CallStatusCard>
            <CallStatusHeader gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <h3>💬 Active Calls ({stats.busyAgents})</h3>
            </CallStatusHeader>
            <CallStatusBody>
              {stats.busyAgents === 0 ? (
                <EmptyState>
                  <div className="empty-icon">💬</div>
                  <div className="empty-text">No active calls</div>
                </EmptyState>
              ) : (
                <CallItemsContainer>
                  {members
                    .filter((agent) => agent.status === 'InUse')
                    .map((agent) => {
                      const matchingCall = activeCalls?.find(
                        (call) => call.calleeid === agent.member_extension,
                      );
                      const callerId = matchingCall
                        ? matchingCall.callerid
                        : `External Call`;

                      return (
                        <CallItem
                          key={`active-${agent.member_extension}`}
                          bgColor="rgba(16, 185, 129, 0.1)"
                          borderColor="rgba(16, 185, 129, 0.2)"
                        >
                          <CallItemHeader>
                            <CallNumber>📱 {callerId}</CallNumber>
                            <CallTime color="#059669">Talking</CallTime>
                          </CallItemHeader>
                          <CallDetails>
                            <span>👤</span>
                            <span>{agent.first_name}</span>
                            <span>•</span>
                            <span>Ext: {agent.member_extension}</span>
                          </CallDetails>
                        </CallItem>
                      );
                    })}
                </CallItemsContainer>
              )}
            </CallStatusBody>
          </CallStatusCard>
        </CallStatusContainer>
      </MainGrid>
    </DashboardContainer>
  );
};

export default EnhancedCallCenterDashboard;
