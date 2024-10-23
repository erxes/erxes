import { escapeExpression } from "handlebars";
import { models } from "./setup";

describe("Brand DB tests", () => {
  beforeAll(async () => {
    await models.Brands.deleteMany({});
  });
  afterAll(async () => {
    await models.Brands.deleteMany({});
  });

  test("Generate Code", async () => {
    const testCode = "testCode";
    let code = await models.Brands.generateCode(testCode);
    const createdBrand = await models.Brands.createBrand({
      code,
    });
    expect(code).toBe(testCode);
    expect(code).toBeDefined();

    code = await models.Brands.generateCode("DFAFFADFSF");
    expect(code).toBeDefined();
  });

  test("Get Brand", async () => {
    let code = "testCode";
    let createdAt = new Date();
    try {
      await models.Brands.getBrand({ code, createdAt });
    } catch (e) {
      expect(e.message).toBe("Brand not found");
    }

    const name = "testName";
    const description = "testDescription";
    const userId = "testId";
    const createdBrand = await models.Brands.createBrand({
      name,
      description,
      userId,
      code,
    });
    let doc = {
      code: createdBrand.code,
      createdAt: createdBrand.createdAt,
    };
    expect(await models.Brands.getBrand(doc)).toBeDefined();
  });

  test("Create Brand", async () => {
    const name = "testName";
    const description = "testDescription";
    const userId = "testId";
    const createBrand = await models.Brands.createBrand({
      name,
      description,
      userId,
    });

    expect(createBrand).toBeDefined();
    expect(createBrand.code).toBeDefined();
    expect(createBrand.name).toBe(name);
    expect(createBrand.userId).toBe(userId);
  });

  test("Update Brand", async () => {
    const name = "testName";
    const description = "testDescription";
    const userId = "testUserId";

    const createdBrand = await models.Brands.createBrand({
      name,
      description,
      userId,
    });

    const updatedName = "updatedName";
    const updatedDescription = "updatedDescription";

    const updatedBrand = await models.Brands.updateBrand(createdBrand._id, {
      name: updatedName,
      description: updatedDescription,
    });

    expect(createdBrand._id).toBe(updatedBrand._id);
    expect(updatedBrand.name).toBe(updatedName);
  });

  test("Remove Brand", async () => {
    const name = "testName";
    const description = "testDescription";
    const userId = "testUserId";

    const createdBrand = await models.Brands.createBrand({
      name,
      description,
      userId,
    });
    const fakeId = "fakeId";
    try {
      await models.Brands.removeBrand(fakeId);
    } catch (e) {
      expect(e.message).toBe(`Brand not found with id ${fakeId}`);
    }

    expect(await models.Brands.removeBrand(createdBrand._id)).toBeTruthy();
  });
});
