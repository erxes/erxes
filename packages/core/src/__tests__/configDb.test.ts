import { create } from "domain";
import { models } from "./setup";

describe("Companies DB test", () => {
  beforeAll(async () => {
    await models.Configs.deleteMany({});
  });
  afterAll(async () => {
    await models.Configs.deleteMany({});
  });

  test("Get Config", async () => {
    try {
      await models.Configs.getConfig("fakeId");
    } catch (e) {
      expect(e.message).toBe("Config not found");
    }

    const code = "testCode";
    const value = ["tets", "test2"];
    const createdConfig = await models.Configs.createOrUpdateConfig({
      code,
      value,
    });
    const result = await models.Configs.getConfig(createdConfig.code);
    expect(result).toBeDefined();
  });

  test("Create Config", async () => {
    const code = "testCode";
    const value = ["tets", "test2"];
    const createdConfig = await models.Configs.createOrUpdateConfig({
      code,
      value,
    });
    expect(createdConfig).toBeDefined();
    expect(createdConfig.value.length).toEqual(2);
  });

  test("Update Config", async () => {
    const code = "testCode";
    const value = ["tets", "test2"];
    const createdConfig = await models.Configs.createOrUpdateConfig({
      code,
      value,
    });

    const updatedConfig = await models.Configs.createOrUpdateConfig({
      code,
      value: ["update"],
    });

    expect(updatedConfig).toBeDefined();
    expect(updatedConfig.code).toEqual(code);
    expect(updatedConfig.value.length).toEqual(1);
  });

  test("Constants test", async () => {
    const code = "testCode";
    const label = "test";
    const value = ["tets", "test2"];
    const createdConfig = await models.Configs.createOrUpdateConfig({
      code,
      value,
    });

    const constants = await models.Configs.constants();

    expect(constants).toBeDefined();
  });
});
