import * as admin from 'firebase-admin';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';

interface FirebaseAppCache {
  [clientPortalId: string]: admin.app.App;
}

class FirebaseService {
  private appCache: FirebaseAppCache = {};

  async initializeFirebase(
    clientPortalId: string,
    serviceAccountKey: string,
  ): Promise<admin.app.App> {
    if (this.appCache[clientPortalId]) {
      return this.appCache[clientPortalId];
    }

    if (!serviceAccountKey) {
      throw new Error('Firebase service account key is required');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
      throw new Error('Invalid Firebase service account key format');
    }

    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
      },
      `client-portal-${clientPortalId}`,
    );

    this.appCache[clientPortalId] = app;
    return app;
  }

  async sendNotification(
    clientPortalId: string,
    tokens: string[],
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<admin.messaging.BatchResponse> {
    const app = this.appCache[clientPortalId];
    if (!app) {
      throw new Error(
        `Firebase not initialized for client portal: ${clientPortalId}`,
      );
    }

    const messaging = admin.messaging(app);

    const message: admin.messaging.MulticastMessage = {
      notification,
      data,
      tokens,
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      return response;
    } catch (error) {
      throw new Error(
        `Failed to send Firebase notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async sendBatchNotifications(
    clientPortalId: string,
    notifications: Array<{
      tokens: string[];
      notification: {
        title: string;
        body: string;
      };
      data?: Record<string, string>;
    }>,
  ): Promise<admin.messaging.BatchResponse[]> {
    const app = this.appCache[clientPortalId];
    if (!app) {
      throw new Error(
        `Firebase not initialized for client portal: ${clientPortalId}`,
      );
    }

    const messaging = admin.messaging(app);
    const results: admin.messaging.BatchResponse[] = [];

    for (const notification of notifications) {
      const message: admin.messaging.MulticastMessage = {
        notification: notification.notification,
        data: notification.data,
        tokens: notification.tokens,
      };

      try {
        const response = await messaging.sendEachForMulticast(message);
        results.push(response);
      } catch (error) {
        throw new Error(
          `Failed to send batch Firebase notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return results;
  }

  async initializeFromClientPortal(
    clientPortal: IClientPortalDocument,
  ): Promise<admin.app.App | null> {
    const firebaseConfig = clientPortal.firebaseConfig;

    if (!firebaseConfig?.enabled || !firebaseConfig?.serviceAccountKey) {
      return null;
    }

    return this.initializeFirebase(
      clientPortal._id,
      firebaseConfig.serviceAccountKey,
    );
  }

  removeApp(clientPortalId: string): void {
    if (this.appCache[clientPortalId]) {
      delete this.appCache[clientPortalId];
    }
  }
}

export const firebaseService = new FirebaseService();
