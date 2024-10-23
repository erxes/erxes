import { models } from "./setup";

describe("Brand DB tests", () => {
  beforeAll(async () => {
    await models.EmailDeliveries.deleteMany({});
  });
  afterAll(async () => {
    await models.EmailDeliveries.deleteMany({});
  });

  test("Create EmailDeliveries", async () => {
    const doc = {
      subject: "test",
      body: "test",
      to: ["test"],
      from: "test",
      kind: "test",
    };

    const createdEmailDeliveries =
      await models.EmailDeliveries.createEmailDelivery(doc);
    expect(createdEmailDeliveries).toBeDefined();
    expect(createdEmailDeliveries.subject).toBe(doc.subject);
  });

  test("Update EmailDeliveries", async () => {
    const doc = {
      subject: "test",
      body: "test",
      to: ["test"],
      from: "test",
      kind: "test",
      status: "pending",
    };

    const createdEmailDeliveries =
      await models.EmailDeliveries.createEmailDelivery(doc);

    const result = await models.EmailDeliveries.updateEmailDeliveryStatus(
      createdEmailDeliveries.id,
      "recieved"
    );
  });
});
