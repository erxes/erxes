const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")
const ts = require("typescript")

const filename = path.resolve(__dirname, "../coverDates.ts")
const mod = { exports: {} }
vm.runInNewContext(
  ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { module: mod, exports: mod.exports, require, Date },
  { filename }
)
const { createCoverDatesSchema, getCoverEndDate } = mod.exports
const now = new Date(2026, 10, 3, 10, 30, 25)
const schema = createCoverDatesSchema(() => now)

test("yesterday evening is allowed when the current time is in the morning", () => {
  assert.equal(
    schema.safeParse({ endDate: new Date(2026, 10, 2), time: "23:45" }).success,
    true
  )
})
test("today's future time fails on the time field", () => {
  const result = schema.safeParse({
    endDate: new Date(2026, 10, 3),
    time: "23:45",
  })
  assert.equal(result.success, false)
  assert.equal(result.error.issues[0].path[0], "time")
})
test("current minute is allowed but a future date's earlier hour is not", () => {
  assert.equal(
    schema.safeParse({ endDate: new Date(2026, 10, 3), time: "10:30" }).success,
    true
  )
  assert.equal(
    schema.safeParse({ endDate: new Date(2026, 10, 4), time: "00:01" }).success,
    false
  )
})
test("the submitted timestamp combines local date/time without inherited seconds", () => {
  const selected = new Date(2026, 10, 2, 15, 30, 59, 999)
  const end = getCoverEndDate(selected, "23:45")
  assert.equal(end.getDate(), 2)
  assert.equal(end.getHours(), 23)
  assert.equal(end.getMinutes(), 45)
  assert.equal(end.getSeconds(), 0)
  assert.equal(end.getMilliseconds(), 0)
  assert.equal(selected.getHours(), 15)
})
test("invalid and missing times cannot bypass combined validation", () => {
  for (const time of ["", "24:00", "23:60", "2:00"]) {
    assert.equal(
      schema.safeParse({ endDate: new Date(2026, 10, 2), time }).success,
      false
    )
  }
})
test("validation uses the current time on submission rather than form opening time", () => {
  let clock = new Date(2026, 10, 3, 10)
  const currentSchema = createCoverDatesSchema(() => clock)
  const values = { endDate: new Date(2026, 10, 3), time: "10:30" }
  assert.equal(currentSchema.safeParse(values).success, false)
  clock = new Date(2026, 10, 3, 11)
  assert.equal(currentSchema.safeParse(values).success, true)
})
