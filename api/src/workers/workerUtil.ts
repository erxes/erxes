import * as os from 'os';
import { debugImport, debugWorkers } from '../debuggers';

export default class CustomWorker {
  readonly cpuCount: number = os.cpus().length;
  handleEnd?: () => Promise<void>;
  workers: Array<{ id?: string; status: 'free' | 'busy'; instance?: any }> = [];
  pendingWorkers: number = 0;

  constructor() {
    new Array(this.cpuCount).fill(0).forEach(() => {
      this.workers.push({ status: 'free' });
    });
  }

  async createWorker(workerPath: string, workerData: object) {
    try {
      this.pendingWorkers++;

      const { worker, workerIndex } = await this.getFreeWorker();

      // tslint:disable-next-line
      const Worker = require('worker_threads').Worker;

      const workerInstance = new Worker(workerPath, { workerData });

      worker.id = workerInstance.threadId;
      worker.instance = workerInstance;
      worker.status = 'busy';

      this.workers[workerIndex] = worker;

      workerInstance.on('message', data => {
        const { action, message } = data;

        this.pendingWorkers--;

        debugWorkers(message);

        if (action === 'remove') {
          this.removeWorker(workerInstance.threadId);
        }

        if (this.handleEnd && this.pendingWorkers === 0) {
          this.handleEnd();
        }
      });

      workerInstance.on('error', e => {
        debugImport(e);
        this.removeWorker(workerInstance.threadId);
      });

      workerInstance.on('exit', code => {
        if (code !== 0) {
          debugImport(`Worker stopped with exit code ${code}`);
        }
      });
    } catch (e) {
      debugWorkers('Failed to create a worker');
      throw e;
    }
  }

  async getFreeWorker(): Promise<{ worker: any; workerIndex: number }> {
    return new Promise(resolve => {
      let interval;

      const findFreeWorker = () => {
        const workerIndex = this.workers.findIndex(
          item => item.status === 'free'
        );

        if (workerIndex !== -1) {
          clearInterval(interval);

          resolve({
            worker: this.workers[workerIndex],
            workerIndex
          });

          return;
        }

        return findFreeWorker;
      };

      interval = setInterval(findFreeWorker() as any, 1500);
    });
  }

  setHandleEnd(handleEnd: () => Promise<void>) {
    this.handleEnd = handleEnd;
  }

  removeWorker(id: string) {
    this.workers = this.workers.map(worker => {
      if (worker.id === id) {
        worker.instance.terminate();

        return this.clearWorker(worker);
      }

      return worker;
    });
  }

  removeWorkers() {
    this.workers = this.workers.map(worker => {
      if (worker && worker.instance) {
        worker.instance.postMessage('cancel');
      }

      return this.clearWorker(worker);
    });
  }

  clearWorker(worker) {
    worker.id = '';
    worker.status = 'free';
    worker.instance = null;

    return worker;
  }
}
