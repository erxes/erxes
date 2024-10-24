import { generateModels } from "../connectionResolver";

beforeAll(() => {
  console.log("beforAll");
});

afterAll(() => {
  console.log("afterAll");
});

test("city database has San Juan", async () => {
  const i = 1;

  const models = await generateModels("os");

  const actity = await models.ActivityLogs.removeActivityLog("123");

  expect(i).toBe(1);
});
