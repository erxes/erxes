const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { webcrypto } = require("node:crypto")
const { test } = require("node:test")
const ts = require("typescript")
const { atom, createStore } = require("jotai/vanilla")

const load = (filename, dependencies) => {
  const mod = { exports: {} }
  vm.runInNewContext(
    ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      module: mod,
      exports: mod.exports,
      crypto: webcrypto,
      require: (id) => dependencies[id],
    },
    { filename }
  )
  return mod.exports
}
function fixture() {
  const store = createStore()
  const states = load(
    path.resolve(process.cwd(), "apps/posclient-front/store/cover.store.ts"),
    { jotai: { atom } }
  )
  store.set(states.activeCoverIdAtom, "cover")
  store.set(states.coverStatusAtom, "draft")
  store.set(states.isCoverAmountsFetchedAtom, true)
  const submissions = []
  const hook = load(path.resolve(__dirname, "../useCoverSave.ts"), {
    jotai: { useStore: () => store },
    "next/navigation": {
      useSearchParams: () => new URLSearchParams("id=cover"),
    },
    "@/modules/auth/hooks/useUser": { default: () => ({ userId: "user" }) },
    "@/store/cover.store": states,
    "@/store/config.store": { paymentTypesAtom: atom([{ type: "TDBCard" }]) },
    "@/lib/constants": { ALL_BANK_CARD_TYPES: ["TDBCard"] },
    "../graphql": { mutations: { coversEdit: {} } },
    "@apollo/client": {
      useMutation: () => [
        async ({ variables }) => {
          submissions.push(variables)
          return {
            data: {
              coversEdit: {
                _id: "cover",
                status: "new",
                details: variables.details,
              },
            },
          }
        },
        { loading: false },
      ],
    },
  })
  return { ...hook.useCoverSave(), store, states, submissions }
}
test("manual closing note is submitted unchanged and payment row IDs survive later saves", async () => {
  const f = fixture()
  const note = "Хаалтын тэмдэглэл\nКассын зөрүү 12500₮"
  f.store.set(f.states.descriptionAtom, note)
  await f.saveCover()
  assert.equal(f.submissions[0].description, note)
  assert.equal(f.store.get(f.states.coverStatusAtom), "new")
  assert.equal(f.submissions[0].details[0].paidType, "TDBCard")
  assert.equal(f.submissions[0].details[0].paidSummary[0].amount, 0)
  await f.saveCover()
  assert.equal(f.submissions[1].details[0]._id, f.submissions[0].details[0]._id)
  assert.equal(f.submissions[1].description, note)
})
test("terminal responses derive from payment details without overwriting the closing note", () => {
  const f = fixture()
  f.store.set(f.states.descriptionAtom, "Keep this manual note")
  f.store.set(f.states.detailsAtom, [
    {
      paidType: "TDBCard",
      terminalResults: [{ _id: "first", response: "receipt" }],
    },
  ])
  assert.equal(f.store.get(f.states.terminalResultsAtom)[0].response, "receipt")
  f.store.set(f.states.detailsAtom, [])
  assert.equal(f.store.get(f.states.terminalResultsAtom).length, 0)
  assert.equal(f.store.get(f.states.descriptionAtom), "Keep this manual note")
})
test("saving before system totals are fetched sends no mutation", async () => {
  const f = fixture()
  f.store.set(f.states.isCoverAmountsFetchedAtom, false)
  await assert.rejects(f.saveCover(), /хаалтын дүн татна/)
  assert.equal(f.submissions.length, 0)
})
