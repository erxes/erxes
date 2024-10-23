import { models } from "./setup";

describe("Brand tests", () => {
  beforeAll(async () => {
    await models.Brands.deleteMany({});
  });
  afterAll(async () => {
    await models.Brands.deleteMany({});
  });

  test("Generate code", async () => {
    let code = "testCode";
    let generatedCode = await models.Brands.generateCode(code);

    expect(generatedCode).toBeDefined();
  });
});
