const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")
const { webcrypto } = require("node:crypto")
const ts = require("typescript")
const { atom, createStore } = require("jotai/vanilla")
const { z } = require("zod")

function fixture(shared = {}) {
  const store = createStore()
  const atoms = {
    activeCoverIdAtom: atom("cover"),
    detailsAtom: atom([]),
    coverStatusAtom: atom("new"),
    terminalFetchBusyAtom: atom(false),
  }
  atoms.terminalResultsAtom = atom((get) =>
    get(atoms.detailsAtom).flatMap((detail) =>
      (detail.terminalResults || []).map((result) => ({
        ...result,
        bank: detail.paidType,
      }))
    )
  )
  const storage = shared.storage || new Map()
  const records = shared.records || []
  const events = []
  const errors = []
  let failCompletion = false
  let failSave = false
  const localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  const filename = path.resolve(__dirname, "../useCoverTerminalFetch.ts")
  const mod = { exports: {} }
  vm.runInNewContext(
    ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      module: mod,
      exports: mod.exports,
      localStorage,
      crypto: webcrypto,
      Response,
      Error,
      require: (id) => {
        if (id === "react") return { useEffect: (run) => run() }
        if (id === "next/navigation")
          return { useSearchParams: () => new URLSearchParams("id=cover") }
        if (id === "jotai")
          return {
            atom,
            useStore: () => store,
            useAtomValue: (state) => store.get(state),
          }
        if (id === "zod") return { z }
        if (id === "@/store/cover.store") return atoms
        if (id === "@/components/ui/use-toast")
          return { onError: (message) => errors.push(message), toast: () => {} }
        if (id === "../graphql")
          return { mutations: { terminalResultSave: {} } }
        if (id === "./useCoverSave")
          return {
            useCoverSave: () => ({
              saveCover: async () => {
                events.push("save")
                if (failSave) throw new Error("draft save failed")
                return "cover"
              },
            }),
          }
        if (id === "@apollo/client")
          return {
            useMutation: () => [
              async ({ variables }) => {
                events.push(
                  variables.response === undefined ? "reserve" : "complete"
                )
                let entry = records.find(
                  (record) => record._id === variables.resultId
                )
                if (!entry) {
                  entry = {
                    _id: variables.resultId,
                    bank: variables.bank,
                    createdAt: new Date().toISOString(),
                  }
                  records.push(entry)
                }
                if (variables.response !== undefined) {
                  if (failCompletion)
                    throw new Error("connection lost after terminal response")
                  entry.response = variables.response
                }
                return {
                  data: {
                    posclientCoverTerminalResultSave: {
                      details: [
                        ...new Set(records.map((record) => record.bank)),
                      ].map((paidType) => ({
                        paidType,
                        terminalResults: records
                          .filter((record) => record.bank === paidType)
                          .map((record) => ({ ...record })),
                      })),
                    },
                  },
                }
              },
            ],
          }
        throw new Error(`Unexpected import: ${id}`)
      },
    },
    { filename }
  )
  return {
    hook: mod.exports.useCoverTerminalFetch,
    readResponse: mod.exports.readTerminalResponse,
    records,
    events,
    errors,
    storage,
    store,
    atoms,
    failCompletion: (value = true) => {
      failCompletion = value
    },
    failSave: () => {
      failSave = true
    },
  }
}

test("saves the draft and reserves a server entry before contacting the terminal", async () => {
  const f = fixture()
  await f.hook().fetchTerminal("TDBCard", async () => {
    f.events.push("terminal")
    return { amount: 42 }
  })
  assert.deepEqual(f.events, ["save", "reserve", "terminal", "complete"])
  assert.equal(JSON.parse(f.records[0].response).amount, 42)
  assert.equal(f.storage.size, 0)
})
test("multiple fetches keep independent results for the same bank", async () => {
  const f = fixture()
  await f.hook().fetchTerminal("TDBCard", async () => ({ amount: 10 }))
  await f.hook().fetchTerminal("TDBCard", async () => ({ amount: 20 }))
  assert.equal(f.records.length, 2)
  assert.notEqual(f.records[0]._id, f.records[1]._id)
  assert.deepEqual(
    f.records.map((record) => JSON.parse(record.response).amount),
    [10, 20]
  )
})
test("a failed draft save never calls the terminal", async () => {
  const f = fixture()
  f.failSave()
  await f.hook().fetchTerminal("TDBCard", async () => {
    throw new Error("must not be called")
  })
  assert.deepEqual(f.events, ["save"])
  assert.equal(f.records.length, 0)
})
test("failed persistence retains the response and retries without settling twice", async () => {
  const f = fixture()
  f.failCompletion()
  let terminalCalls = 0
  await f.hook().fetchTerminal("TDBCard", async () => {
    terminalCalls++
    return { amount: 99 }
  })
  assert.equal(f.storage.size, 1)
  assert.equal(JSON.parse([...f.storage.values()][0]).response, '{"amount":99}')
  await f.hook().fetchTerminal("TDBCard", async () => {
    terminalCalls++
  })
  assert.equal(terminalCalls, 1)
  f.failCompletion(false)
  await f.hook().retryPending()
  assert.equal(terminalCalls, 1)
  assert.equal(f.records[0].response, '{"amount":99}')
  assert.equal(f.storage.size, 0)
})
test("network failures are recorded as unknown outcomes instead of losing the fetch", async () => {
  const f = fixture()
  await f.hook().fetchTerminal("TDBCard", async () => {
    throw new Error("terminal offline")
  })
  const response = JSON.parse(f.records[0].response)
  assert.equal(response.error, "terminal offline")
  assert.match(response.outcome, /unknown/)
})
test("concurrent bank clicks cannot start a second terminal request", async () => {
  const f = fixture()
  let finish
  const first = f.hook().fetchTerminal(
    "TDBCard",
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  await new Promise((resolve) => setImmediate(resolve))
  await f.hook().fetchTerminal("capitron", async () => {
    throw new Error("must not be called")
  })
  finish({ amount: 1 })
  await first
  assert.equal(f.records.length, 1)
})
test("confirmed covers cannot fetch terminal data", async () => {
  const f = fixture()
  f.store.set(f.atoms.coverStatusAtom, "confirm")
  await f.hook().fetchTerminal("TDBCard", async () => {
    throw new Error("must not be called")
  })
  assert.equal(f.events.length, 0)
})
test("non-JSON terminal responses retain the original body and HTTP status", async () => {
  const f = fixture()
  const result = await f.readResponse(
    new Response("terminal busy", { status: 503 })
  )
  assert.equal(result.result, "terminal busy")
  assert.equal(result.httpStatus, 503)
})

test("a browser reload restores the unsaved response and completes without another terminal call", async () => {
  const first = fixture()
  first.failCompletion()
  await first.hook().fetchTerminal("TDBCard", async () => ({ amount: 123 }))
  const reloaded = fixture({ storage: first.storage, records: first.records })
  await reloaded.hook().retryPending()
  assert.equal(reloaded.records[0].response, '{"amount":123}')
  assert.equal(reloaded.storage.size, 0)
  assert.equal(reloaded.events.includes("terminal"), false)
})
test("a late response from another cover cannot overwrite the currently open cover state", async () => {
  const f = fixture()
  let finish
  const run = f.hook().fetchTerminal(
    "TDBCard",
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  await new Promise((resolve) => setImmediate(resolve))
  f.store.set(f.atoms.activeCoverIdAtom, "other-cover")
  f.store.set(f.atoms.detailsAtom, [
    { paidType: "TDBCard", terminalResults: [{ _id: "other-result" }] },
  ])
  finish({ amount: 7 })
  await run
  assert.equal(f.store.get(f.atoms.terminalResultsAtom)[0]._id, "other-result")
  assert.equal(f.records[0].response, '{"amount":7}')
})

test("terminal responses stay in separate paidType details", async () => {
  const f = fixture()
  await f.hook().fetchTerminal("TDBCard", async () => ({ amount: 10 }))
  await f.hook().fetchTerminal("capitron", async () => ({ amount: 20 }))
  const details = f.store.get(f.atoms.detailsAtom)
  assert.deepEqual(
    details.map((detail) => detail.paidType),
    ["TDBCard", "capitron"]
  )
  assert.equal(details[0].terminalResults.length, 1)
  assert.equal(details[1].terminalResults.length, 1)
  assert.equal(JSON.parse(details[0].terminalResults[0].response).amount, 10)
  assert.equal(JSON.parse(details[1].terminalResults[0].response).amount, 20)
})
