import { models } from "./setup";

describe("App class tests", () => {
  beforeAll(async () => {
    await models.Apps.deleteMany({});
  });
  afterAll(async () => {
    await models.Apps.deleteMany({});
  });

  test("Get App", async () => {
    const _id = "test";
    const name = "testapp";
    const userGroupId = "testId";
    const expireDate = new Date();

    try {
      await models.Apps.getApp(_id);
    } catch (e) {
      expect(e.message).toBe("App not found");
    }

    const createdApp = await models.Apps.createApp({
      userGroupId,
      name,
      expireDate,
    });
    const result = await models.Apps.getApp(createdApp._id);
    expect(result).toBeDefined();
  });

  test("Create App", async () => {
    const name = "testapp";
    const userGroupId = "testId";
    const expireDate = new Date();
    const createdApp = await models.Apps.createApp({
      userGroupId,
      name,
      expireDate,
    });
    const result = await models.Apps.getApp(createdApp._id);

    expect(result.expireDate).toEqual(createdApp.expireDate);
  });

  test("Update App", async () => {
    const name = "testapp";
    const userGroupId = "testId";
    const expireDate = new Date();
    const updateName = "updatedName";
    const updatedUserGroupId = "updatedId";

    const createdApp = await models.Apps.createApp({
      userGroupId,
      name,
      expireDate,
    });
    const updatedApp = await models.Apps.updateApp(createdApp._id, {
      name: updateName,
      userGroupId: updatedUserGroupId,
    });

    expect(updatedApp.name).toBe(updateName);
    expect(createdApp._id).toBe(updatedApp._id);
  });

  test("Remove App", async () => {
    const name = "testapp";
    const userGroupId = "testId";
    const expireDate = new Date();

    const createdApp = await models.Apps.createApp({
      userGroupId,
      name,
      expireDate,
    });

    expect(await models.Apps.removeApp(createdApp._id)).toBeTruthy();
  });

  test("Remove enabled app", async () => {
    const name = "testapp";
    const userGroupId = "testId";
    const expireDate = new Date();

    const createdApp = await models.Apps.createApp({
      userGroupId,
      name,
      expireDate,
      isEnabled: true,
    });

    try {
      await models.Apps.removeApp(createdApp._id);
    } catch (e) {
      expect(e.message).toBe("Can not remove an enabled app");
    }
  });
});
