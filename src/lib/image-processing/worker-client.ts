import { ProcessRequest, ProcessResponse } from './types';

type PendingTask = {
  resolve: (res: ProcessResponse) => void;
  reject: (err: Error) => void;
};

export class WorkerPool {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private taskQueue: Array<{
    request: ProcessRequest;
    resolve: (res: ProcessResponse) => void;
    reject: (err: Error) => void;
  }> = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(new URL('../../workers/imageProcessor.worker.ts', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e: MessageEvent<ProcessResponse>) => {
        this.handleResponse(worker, e.data);
      };
      
      worker.onerror = (err) => {
        console.error("Worker error:", err);
      };

      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }
  }

  private pendingTasks = new Map<string, PendingTask>();

  private handleResponse(worker: Worker, response: ProcessResponse) {
    const task = this.pendingTasks.get(response.id);
    if (task) {
      if (response.error) {
        task.reject(new Error(response.error));
      } else {
        task.resolve(response);
      }
      this.pendingTasks.delete(response.id);
    }
    
    // Worker is now idle, process next task if any
    this.idleWorkers.push(worker);
    this.processNextTask();
  }

  private processNextTask() {
    if (this.taskQueue.length > 0 && this.idleWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.idleWorkers.shift()!;
      
      this.pendingTasks.set(task.request.id, { resolve: task.resolve, reject: task.reject });
      
      // Transfer the buffer to the worker
      worker.postMessage(task.request, { transfer: [task.request.imageData.data.buffer] });
    }
  }

  public processImage(request: ProcessRequest): Promise<ProcessResponse> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ request, resolve, reject });
      this.processNextTask();
    });
  }

  public terminateAll() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.idleWorkers = [];
    this.pendingTasks.clear();
    this.taskQueue = [];
  }
}

// Singleton pattern for the pool
let globalPool: WorkerPool | null = null;

export function getWorkerPool(): WorkerPool {
  if (!globalPool) {
    // Clamp concurrency between 1 and 4 as per prompt
    const hwConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 2;
    const poolSize = Math.max(1, Math.min(4, Math.floor(hwConcurrency / 2) || 2));
    globalPool = new WorkerPool(poolSize);
  }
  return globalPool;
}
