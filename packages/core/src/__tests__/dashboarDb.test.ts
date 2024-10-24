import { escapeExpression } from "handlebars";
import { models } from "./setup";
import exp from "constants";

describe("Brand DB tests", () => {
  beforeAll(async () => {
    await models.Dashboards.deleteMany({});
  });
  afterAll(async () => {
    await models.Dashboards.deleteMany({});
  });

  test("Get Dashboard", async () => {
    try {
      await models.Dashboards.getDashboard("fakeId");
    } catch (e) {
      expect(e.message).toBe("Dashboard not found");
    }
    enum IVisibilityType {
      PUBLIC = "public",
      PRIVATE = "private",
    }
    const doc = {
      name: "test",
      sectionId: "testId",
      assignedUserIds: ["test"],
      assignedDepartmentIds: ["test"],

      visibility: IVisibilityType.PRIVATE,
      memberIds: ["test"],

      createdAt: new Date(),
      createdBy: "test",

      updatedAt: new Date(),
      updatedBy: "test",
    };

    const createdDashboar = await models.Dashboards.createDashboard(doc);

    const result = await models.Dashboards.getDashboard(createdDashboar._id);
    expect(result).toBeDefined();
  });

  test("Create Dashboard", async () => {
    enum IVisibilityType {
      PUBLIC = "public",
      PRIVATE = "private",
    }
    const doc = {
      name: "test",
      sectionId: "testId",
      assignedUserIds: ["test"],
      assignedDepartmentIds: ["test"],

      visibility: IVisibilityType.PRIVATE,
      memberIds: ["test"],

      createdAt: new Date(),
      createdBy: "test",

      updatedAt: new Date(),
      updatedBy: "test",
    };

    const createdDashboard = await models.Dashboards.createDashboard(doc);

    expect(createdDashboard).toBeDefined();
    expect(createdDashboard.name).toBe(doc.name);
  });

  test("Update Dashboard", async () => {
    enum IVisibilityType {
      PUBLIC = "public",
      PRIVATE = "private",
    }
    const doc = {
      name: "test",
      sectionId: "testId",
      assignedUserIds: ["test"],
      assignedDepartmentIds: ["test"],

      visibility: IVisibilityType.PRIVATE,
      memberIds: ["test"],

      createdAt: new Date(),
      createdBy: "test",

      updatedAt: new Date(),
      updatedBy: "test",
    };

    const updatedDoc = {
      name: "update",
      sectionId: "testId",
      assignedUserIds: ["test"],
      assignedDepartmentIds: ["test"],

      visibility: IVisibilityType.PRIVATE,
      memberIds: ["test"],

      createdAt: new Date(),
      createdBy: "test",

      updatedAt: new Date(),
      updatedBy: "test",
    };
    const createdDashboard = await models.Dashboards.createDashboard(doc);
    const updatedDashboard = await models.Dashboards.updateDashboard(
      createdDashboard._id,
      updatedDoc
    );

    try {
      await models.Dashboards.updateDashboard("fakeid", updatedDoc);
    } catch (e) {
      expect(e.message).toBe("Dashboard not found");
    }

    expect(createdDashboard._id).toBe(updatedDashboard._id);
    expect(updatedDashboard.name).toBe(updatedDoc.name);
  });

  test("Delete Dashboard", async () => {
    enum IVisibilityType {
      PUBLIC = "public",
      PRIVATE = "private",
    }
    const doc = {
      name: "test",
      sectionId: "testId",
      assignedUserIds: ["test"],
      assignedDepartmentIds: ["test"],

      visibility: IVisibilityType.PRIVATE,
      memberIds: ["test"],

      createdAt: new Date(),
      createdBy: "test",

      updatedAt: new Date(),
      updatedBy: "test",
    };

    try {
      await models.Dashboards.removeDashboard("fakeid");
    } catch (e) {
      expect(e.message).toBe("Dashboard not found");
    }

    const createdDashboard = await models.Dashboards.createDashboard(doc);
    const deletedDashboard = await models.Dashboards.removeDashboard(
      createdDashboard._id
    );
    expect(deletedDashboard).toBeTruthy();
  });
});
