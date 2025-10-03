import WebSocket from 'ws';
import crypto from 'crypto';
import { generateModels } from '~/connectionResolvers';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import redis from './redlock';

const { CALL_WS_API_USER, CALL_WS_API_PASSWORD, CALL_WS_SERVER } = process.env;
// Configuration
const CONFIG = {
  PBX_IP: CALL_WS_SERVER,
  API_USER: CALL_WS_API_USER,
  API_PASSWORD: CALL_WS_API_PASSWORD,
  WS_PORT: 8089,
  HEARTBEAT_INTERVAL: 30000,
  MAX_RECONNECT_DELAY: 30000,
  RECONNECT_BASE_DELAY: 1000,
  ALLOW_INSECURE_TLS: process.env.CALL_WS_INSECURE === 'true',
} as const;

const WS_URL = `wss://${CONFIG.PBX_IP}:${CONFIG.WS_PORT}/websockify`;

// Set up TLS for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Types
interface AgentInfo {
  member_extension: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  queue_action?: string;
  [key: string]: any;
}

interface QueueCall {
  callerid: string;
  callerchannel?: string;
  state?: string;
  calleeid?: string;
  bridged?: boolean;
  bridge_time?: string;
}

interface QueueState {
  extension: string;
  waiting: QueueCall[];
  talking: QueueCall[];
  agents: AgentInfo[];
  stats: any;
}

interface PBXMessage {
  type: string;
  message: any;
}

interface PBXEvent {
  eventname?: string;
  eventbody?: any[];
  extension?: string;
  action?: string;
  queue_action?: string;
  callerid?: string;
  callernum?: string;
  calleeid?: string;
  callerchannel?: string;
  calleechannel?: string;
  member_extension?: string;
  bridge_time?: string;
  [key: string]: any;
}

// State Management
class QueueStateManager {
  private queueStates: Record<string, QueueState> = {};

  initializeQueue(extension: string): void {
    if (!this.queueStates[extension]) {
      this.queueStates[extension] = {
        extension,
        waiting: [],
        talking: [],
        agents: [],
        stats: {},
      };
    }
  }

  private decodeUTF8Name(name: string): string {
    try {
      let decoded = decodeURIComponent(escape(name));

      if (decoded === name) {
        const buffer = Buffer.from(name, 'latin1');
        decoded = buffer.toString('utf8');
      }

      return decoded;
    } catch {
      return name;
    }
  }

  getQueueState(extension: string): QueueState | undefined {
    return this.queueStates[extension];
  }

  updateQueueStats(extension: string, stats: any): void {
    this.initializeQueue(extension);
    this.queueStates[extension].stats = {
      ...this.queueStates[extension].stats,
      ...stats,
    };
  }

  updateAgent(extension: string, agent: AgentInfo): void {
    this.initializeQueue(extension);
    const agentKey = agent.member_extension || agent.calleeid || agent.member;
    if (agentKey) {
      // Decode names if they exist
      const decodedAgent = {
        ...agent,
        first_name: agent.first_name
          ? this.decodeUTF8Name(agent.first_name)
          : agent.first_name,
        last_name: agent.last_name
          ? this.decodeUTF8Name(agent.last_name)
          : agent.last_name,
      };

      // Find existing agent or add new one
      const existingIndex = this.queueStates[extension].agents.findIndex(
        (a) => a.member_extension === agentKey,
      );

      if (existingIndex >= 0) {
        // Update existing agent
        this.queueStates[extension].agents[existingIndex] = {
          ...this.queueStates[extension].agents[existingIndex],
          ...decodedAgent,
        };
      } else {
        // Add new agent
        this.queueStates[extension].agents.push(decodedAgent);
      }
    }
  }

  handleCallAnswered(
    extension: string,
    callerid: string,
    calleeid: string,
    bridgeTime?: string,
  ): void {
    this.initializeQueue(extension);
    const queue = this.queueStates[extension];

    // Remove from waiting
    queue.waiting = queue.waiting.filter((call) => call.callerid !== callerid);

    // Add to talking
    queue.talking.push({
      callerid,
      calleeid,
      bridged: true,
      bridge_time: bridgeTime || new Date().toISOString(),
    });

    console.log(
      `Call answered: ${callerid} -> ${calleeid}, moved to talking list`,
    );
  }

  handleCallHangup(extension: string, event: PBXEvent): void {
    this.initializeQueue(extension);
    const queue = this.queueStates[extension];

    const callerid = event.callerid;
    const calleeid = event.calleeid;
    const callerchannel = event.callerchannel;
    const calleechannel = event.calleechannel;

    // Remove from both waiting and talking lists
    const beforeWaiting = queue.waiting.length;
    const beforeTalking = queue.talking.length;

    // Filter out the call from waiting list
    queue.waiting = queue.waiting.filter((call) => {
      return call.callerid !== callerid && call.callerchannel !== callerchannel;
    });

    // Filter out the call from talking list
    queue.talking = queue.talking.filter((call) => {
      return (
        call.callerid !== callerid &&
        call.calleeid !== calleeid &&
        call.callerchannel !== callerchannel
      );
    });

    const afterWaiting = queue.waiting.length;
    const afterTalking = queue.talking.length;

    console.log(`Call hangup: ${callerid} -> ${calleeid}`);
    console.log(
      `Waiting: ${beforeWaiting} -> ${afterWaiting}, Talking: ${beforeTalking} -> ${afterTalking}`,
    );
  }

  handleActiveCallEvent(extension: string, event: PBXEvent): void {
    this.initializeQueue(extension);
    const queue = this.queueStates[extension];
    const callerId = event.callernum || event.callerid || '';
    const calleeid = event.calleeid;

    const action = (event.action || '').toLowerCase();
    const queueAction = event.queue_action || '';

    // Handle specific queue actions first
    if (queueAction === 'CallQueueWaiting') {
      this.addWaitingCall(queue, event, callerId);
      return;
    }

    if (queueAction === 'CallQueueHangup') {
      this.handleCallHangup(extension, event);
      return;
    }

    if (queueAction === 'CallQueueAnswered') {
      if (callerId && calleeid) {
        this.handleCallAnswered(
          extension,
          callerId,
          calleeid,
          event.bridge_time,
        );
      }
      return;
    }

    // Handle generic actions only if no specific queue action
    if (!callerId || queueAction) return;

    switch (action) {
      case 'add':
        this.addWaitingCall(queue, event, callerId);
        break;
      case 'update':
        this.updateCall(queue, event, callerId);
        break;
      case 'delete':
        this.removeCall(queue, event, callerId);
        break;
    }
  }

  private addWaitingCall(
    queue: QueueState,
    event: PBXEvent,
    callerId: string,
  ): void {
    // Check if call already exists in waiting or talking
    const existsInWaiting = queue.waiting.some(
      (call) => call.callerid === callerId,
    );
    const existsInTalking = queue.talking.some(
      (call) => call.callerid === callerId,
    );

    if (!existsInWaiting && !existsInTalking) {
      queue.waiting.push({
        callerid: callerId,
        callerchannel: event.callerchannel || undefined,
        state: event.state || undefined,
      });

      console.log(`Added call ${callerId} to waiting list`);
    }
  }

  private updateCall(
    queue: QueueState,
    event: PBXEvent,
    callerId: string,
  ): void {
    const isInWaiting = queue.waiting.some(
      (call) => call.callerid === callerId,
    );
    const isCallUp = event.state && event.state.toLowerCase().includes('up');

    if (isCallUp && isInWaiting) {
      // Move from waiting to talking
      queue.waiting = queue.waiting.filter(
        (call) => call.callerid !== callerId,
      );
      queue.talking.push({
        callerid: callerId,
        callerchannel: event.callerchannel || undefined,
      });
      console.log(`Moved call ${callerId} from waiting to talking`);
    } else {
      // Update waiting call metadata
      queue.waiting = queue.waiting.map((call) =>
        call.callerid === callerId ? { ...call, ...event } : call,
      );
    }
  }

  private removeCall(
    queue: QueueState,
    event: PBXEvent,
    callerId?: string,
    calleeid?: string,
  ): void {
    const beforeWaiting = queue.waiting.length;
    const beforeTalking = queue.talking.length;

    const channelFilter = (call: QueueCall) =>
      call.callerid !== callerId &&
      call.callerchannel !== event.callerchannel &&
      call.calleeid !== calleeid;

    queue.waiting = queue.waiting.filter(channelFilter);
    queue.talking = queue.talking.filter(channelFilter);

    const afterWaiting = queue.waiting.length;
    const afterTalking = queue.talking.length;

    console.log(
      `Removed call - Waiting: ${beforeWaiting} -> ${afterWaiting}, Talking: ${beforeTalking} -> ${afterTalking}`,
    );
  }

  getAllQueues(): Record<string, QueueState> {
    return { ...this.queueStates };
  }
}

// Event Processing
class EventProcessor {
  constructor(private stateManager: QueueStateManager) {}

  async processEvent(eventData: any): Promise<string[]> {
    const updatedQueues: Set<string> = new Set();
    try {
      const events = this.normalizeEvents(eventData);

      for (const event of events) {
        const queueExtension = this.extractQueueExtension(event);

        if (queueExtension) {
          await this.handleQueueEvent(event, queueExtension);
          updatedQueues.add(queueExtension);
        } else if (this.isActiveCallEvent(event)) {
          this.publishActiveCallEvent(event);
        }
      }
    } catch (error) {
      console.error('Error processing event:', error);
    }

    return Array.from(updatedQueues);
  }

  private normalizeEvents(eventData: any): PBXEvent[] {
    const payload = eventData.message || eventData;

    if (Array.isArray(payload)) {
      return payload.flatMap((item) => this.normalizeEvents(item));
    }

    // Handle nested event structure
    if (payload.eventbody && Array.isArray(payload.eventbody)) {
      return payload.eventbody.flatMap((body: any) => {
        if (body.member && Array.isArray(body.member)) {
          return body.member.map((member: any) => ({
            ...payload,
            ...body,
            ...member,
            extension: body.extension,
          }));
        }
        return [{ ...payload, ...body }];
      });
    }

    return [payload];
  }

  private extractQueueExtension(event: PBXEvent): string | null {
    return event.extension?.toString() || null;
  }

  private isActiveCallEvent(event: PBXEvent): boolean {
    return Boolean(event.action && event.channel);
  }

  private async handleQueueEvent(
    event: PBXEvent,
    queueExtension: string,
  ): Promise<void> {
    // Handle queue statistics
    if (this.isQueueStatsEvent(event)) {
      this.stateManager.updateQueueStats(queueExtension, event);
    }

    // Handle agent updates
    if (event.member_extension && event.queue_action) {
      this.stateManager.updateAgent(queueExtension, event as AgentInfo);
    }

    // Handle call lifecycle events
    if (event.queue_action) {
      this.stateManager.handleActiveCallEvent(queueExtension, event);
    }
    // Handle generic active call events only if no queue_action
    else if (
      event.action &&
      (event.callernum || event.callerid || event.calleeid)
    ) {
      this.stateManager.handleActiveCallEvent(queueExtension, event);
    }
  }

  private isQueueStatsEvent(event: PBXEvent): boolean {
    return (
      event.callswaiting !== undefined ||
      event.callstotal !== undefined ||
      event.callscomplete !== undefined
    );
  }

  private publishActiveCallEvent(event: PBXEvent): void {
    graphqlPubsub.publish('ActiveCallStatus', { activeCallEvent: event });
  }
}

// WebSocket Client
class PBXWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private isSubscribing = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private queues: string[] = [];

  constructor(
    private stateManager: QueueStateManager,
    private eventProcessor: EventProcessor,
  ) {}

  async initialize(): Promise<void> {
    this.queues = await this.loadQueuesFromDB();
    this.initializeQueueStates();
    this.connect();
    this.startHeartbeat();
    this.setupGracefulShutdown();
  }

  private async loadQueuesFromDB(): Promise<string[]> {
    const models = await generateModels('os');
    const integrations = await models.CallIntegrations.find({
      'queues.0': { $exists: true },
    }).lean();

    return integrations.flatMap((integration: any) => integration.queues || []);
  }

  private initializeQueueStates(): void {
    this.queues.forEach((queue) => {
      this.stateManager.initializeQueue(queue.toString());
    });
  }

  private connect(): void {
    this.ws = new WebSocket(
      WS_URL,
      undefined,
      CONFIG.ALLOW_INSECURE_TLS ? { rejectUnauthorized: false } : undefined,
    );
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.on('open', () => this.handleOpen());
    this.ws.on('message', (data) => this.handleMessage(data));
    this.ws.on('close', (code, reason) => this.handleClose(code, reason));
    this.ws.on('error', (error) => this.handleError(error));
  }

  private handleOpen(): void {
    console.log('WebSocket connected to PBX');
    this.reconnectAttempts = 0;
    this.requestChallenge();
  }

  private async handleMessage(data: WebSocket.Data): Promise<void> {
    try {
      const message: PBXMessage = JSON.parse(data.toString());
      await this.processMessage(message);
    } catch (error) {
      console.error('Failed to parse message from PBX:', error);
    }
  }

  private handleClose(code: number, reason: Buffer): void {
    console.warn(`WebSocket closed: ${code} - ${reason.toString()}`);
    this.ws = null;
    this.scheduleReconnect();
  }

  private handleError(error: Error): void {
    console.error('WebSocket error:', error.message);
  }

  private async processMessage(message: PBXMessage): Promise<void> {
    const { type, message: payload } = message;
    if (type === 'response') {
      await this.handleResponse(payload);
    } else if (type === 'event' || payload.eventname || type === 'request') {
      await this.handleEvent(message);
    }
  }

  private async handleResponse(payload: any): Promise<void> {
    switch (payload.action) {
      case 'challenge':
        this.handleChallenge(payload);
        break;
      case 'login':
        this.handleLogin(payload);
        break;
      case 'subscribe':
        this.handleSubscribeResponse(payload);
        break;
      case 'QueueStatus':
      case 'QueueSummary':
        await this.handleInitialQueueResponse(payload);
        break;
    }
  }

  private async handleInitialQueueResponse(payload: any): Promise<void> {
    if (payload.status === 0 && payload.eventbody) {
      // Process initial queue data the same way as events
      const mockEvent = {
        type: 'event',
        message: payload,
      };
      await this.handleEvent(mockEvent);
      console.log(
        `Processed initial status for queue: ${payload.extension || 'unknown'}`,
      );
    }
  }

  private handleChallenge(payload: any): void {
    if (payload.status === 0 && payload.challenge) {
      const token = crypto
        .createHash('md5')
        .update(payload.challenge + CONFIG.API_PASSWORD)
        .digest('hex');

      this.sendMessage({
        type: 'request',
        message: {
          transactionid: `login_${Date.now()}`,
          action: 'login',
          username: CONFIG.API_USER,
          token,
        },
      });
    } else {
      console.error('Challenge failed:', payload);
    }
  }

  private handleLogin(payload: any): void {
    if (payload.status === 0) {
      console.log('Successfully logged in to PBX');
      this.subscribeToEvents();
      // Request initial queue status for all queues
      this.requestInitialQueueStatus();
    } else {
      console.error('Login failed:', payload);
    }
  }

  private handleSubscribeResponse(payload: any): void {
    if (payload.status === 0) {
      console.log('Successfully subscribed to PBX events');
    } else {
      console.error('Subscription failed:', payload);
    }
  }

  private async handleEvent(eventData: any): Promise<void> {
    const updatedQueues = await this.eventProcessor.processEvent(eventData);

    for (const queueExtension of updatedQueues) {
      await this.persistAndPublishChanges(queueExtension);
    }
  }

  private requestChallenge(): void {
    this.sendMessage({
      type: 'request',
      message: {
        action: 'challenge',
        username: CONFIG.API_USER,
        version: '1.0',
        transactionid: `challenge_${Date.now()}`,
      },
    });
  }

  private requestInitialQueueStatus(): void {
    // Request current status for all queues
    this.queues.forEach((queueExtension) => {
      this.sendMessage({
        type: 'request',
        message: {
          transactionid: `initial_status_${Date.now()}_${queueExtension}`,
          action: 'QueueStatus',
          queue: queueExtension,
        },
      });

      // Also request agent status for the queue
      this.sendMessage({
        type: 'request',
        message: {
          transactionid: `initial_agents_${Date.now()}_${queueExtension}`,
          action: 'QueueSummary',
          queue: queueExtension,
        },
      });
    });

    console.log(`Requested initial status for ${this.queues.length} queues`);
  }

  private subscribeToEvents(): void {
    if (
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN ||
      this.isSubscribing
    ) {
      return;
    }

    this.isSubscribing = true;
    const eventNames = [
      `CallQueueStatus/${this.queues.join(',')}`,
      `ActiveCallStatus/${this.queues.join(',')}`,
    ];

    this.sendMessage({
      type: 'request',
      message: {
        transactionid: `subscribe_${Date.now()}`,
        action: 'subscribe',
        eventnames: eventNames,
      },
    });

    this.isSubscribing = false;
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      CONFIG.MAX_RECONNECT_DELAY,
      CONFIG.RECONNECT_BASE_DELAY * 2 ** this.reconnectAttempts,
    );

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );
    setTimeout(() => this.connect(), delay);
  }

  private async persistAndPublishChanges(
    queueExtension: string,
  ): Promise<void> {
    const queueState = this.stateManager.getQueueState(queueExtension);
    if (!queueState) return;

    const key = `callRealtimeHistory:${queueExtension}:aggregate`;
    const newSnapshot = JSON.stringify(queueState);
    const oldSnapshot = await redis.get(key);

    if (oldSnapshot !== newSnapshot) {
      await redis.set(key, newSnapshot);
      graphqlPubsub.publish('queueRealtimeUpdate', {
        queueRealtimeUpdate: newSnapshot,
      });
      console.log(`Published queue update for ${queueExtension}`);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'request',
          message: {
            transactionid: `heartbeat_${Date.now()}`,
            action: 'heartbeat',
          },
        });
      }
    }, CONFIG.HEARTBEAT_INTERVAL);
  }

  private setupGracefulShutdown(): void {
    const cleanup = async () => {
      console.log('Shutting down PBX WebSocket client...');

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      if (this.ws) {
        this.ws.close();
      }

      await redis.quit();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }
}

// Main Service
class PBXWebSocketService {
  private stateManager = new QueueStateManager();
  private eventProcessor = new EventProcessor(this.stateManager);
  private client = new PBXWebSocketClient(
    this.stateManager,
    this.eventProcessor,
  );

  async initialize(): Promise<void> {
    await this.client.initialize();
  }

  getQueueStates(): Record<string, QueueState> {
    return this.stateManager.getAllQueues();
  }
}

// Export the service initializer
export async function initWebsocketService(): Promise<void> {
  const service = new PBXWebSocketService();
  await service.initialize();
}
