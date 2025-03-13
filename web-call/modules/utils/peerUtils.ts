type Task<Value = unknown> = () => Promise<Value>

const DefaultBatchSizeLimit = 64

export class FIFOScheduler {
  schedulerChain: Promise<void>
  constructor() {
    this.schedulerChain = Promise.resolve()
  }

  schedule<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.schedulerChain = this.schedulerChain.then(async () => {
        try {
          resolve(await task())
        } catch (error: any) {
          reject(error)
        }
      })
    })
  }
}

export class BulkRequestDispatcher<RequestEntryParams, BulkResponse> {
  currentBatch: RequestEntryParams[]
  currentBulkResponse: Promise<BulkResponse> | null
  batchSizeLimit: number
  constructor(batchSizeLimit: number = DefaultBatchSizeLimit) {
    this.currentBatch = []
    this.currentBulkResponse = null
    this.batchSizeLimit = batchSizeLimit
  }

  // doBulkRequest will return a bulk response promise.
  // At the event loop iteration end, the accumulated entries will be dispatched as a bulk request
  doBulkRequest(
    params: RequestEntryParams,
    bulkRequestFunc: (bulkCopy: RequestEntryParams[]) => Promise<BulkResponse>
  ): Promise<BulkResponse> {
    if (this.currentBatch.length >= this.batchSizeLimit) {
      // if it reaches the batch size limit, we make another bulk request
      this.currentBatch = []
      this.currentBulkResponse = null
    }
    //console.log(params, "params")
    this.currentBatch.push(params)
    if (this.currentBulkResponse != null) {
      return this.currentBulkResponse
    }
    // save the current batch list reference in the function scope because this.currentBatch could be reset if
    // the batch limit is reached
    let batch = this.currentBatch
    //console.log(this.currentBatch, "this.currentBatch")

    this.currentBulkResponse = new Promise((resolve, reject) => {
      //   script
      //     |
      //     V
      // microtasks (Promise)
      //     |
      //     V
      // macrotasks (setTimeout)
      //
      // macrotasks are ran in the event loop iteration end, so
      // we use that moment to make the bulkRequestFunc call
      setTimeout(() => {
        // When the bulk request happens, the batch list and
        // the response is reset to start another batch. Coming
        // callers will wait for a new response promise
        this.currentBulkResponse = null
        // we cut here to make the bulk request

        //console.log(batch[0], "batchbatchbatch")

        let batchCopy = batch.splice(0, batch.length)
        //console.log(batchCopy, "batchCopy")
        let p = bulkRequestFunc(batchCopy)
        p.then((r) => {
          resolve(r)
        }).catch((err) => {
          reject(err)
        })
      }, 0)
    })
    // This bulk response needs to be processed to extract the the result for the entry
    return this.currentBulkResponse
  }
}
