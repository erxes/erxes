import { models } from "./setup";

beforeAll(async () => {
  await models.ActivityLogs.deleteMany({});
});

test("Activity add activity", async () => {
  const contentId = "12321";
  const contentType = "customer";
  const createdBy = "1232";
  const action = "create";

  const activity = await models.ActivityLogs.addActivityLog({
    contentId,
    contentType,
    createdBy,
    action,
  });

  expect(activity).toBeDefined();
  expect(activity.contentId).toEqual(contentId);
  expect(activity.contentType).toEqual(contentType);
  expect(activity.createdBy).toEqual(createdBy);
  expect(activity.action).toEqual(action);
});

test("Activity add activities", async () => {
  const contentId = "12321";
  const contentType = "customer";
  const createdBy = "1232";
  const action = "create";

  const activities = await models.ActivityLogs.addActivityLogs([
    {
      contentId,
      contentType,
      createdBy,
      action,
    },
    {
      contentId,
      contentType,
      createdBy,
      action,
    },
  ]);

  expect(activities).toBeDefined();
  expect(activities.length).toBe(2);
  expect(activities[0].contentId).toEqual(contentId);
});

test("Activity add delete", async () => {
  const contentId = "1230909";

  await models.ActivityLogs.removeActivityLog(contentId);

  const count = await models.ActivityLogs.find({
    contentId: contentId,
  }).countDocuments();

  expect(count).toBe(0);
});

test("Activity remove activity", async () => {
  const contentId: Promise<any[]> = new Promise((resolve) =>
    resolve(["123123", "34345"])
  );
  const resolvedId: string[] = await contentId;
  const contentType = "customer";

  await models.ActivityLogs.removeActivityLogs(contentType, resolvedId);

  const count = await models.ActivityLogs.find({
    contentType: contentType,
    contentId: resolvedId,
  }).countDocuments();

  expect(count).toBe(0);
});
