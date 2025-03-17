import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";

const classesMutation = {
  programClassesAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const programClass = await models.Classes.createClasses(doc);

    return programClass;
  },
  attendClass: async (
    _root,
    { classId, studentId },
    { user, docModifier, models, subdomain }
  ) => {
    const studentExisting = await models.Classes.findOne({
      _id: classId,
      students: studentId,
    });

    if (studentExisting) {
      throw new Error("Student is already enrolled in this class.");
    }

    await models.Classes.updateOne(
      { _id: classId },
      {
        $addToSet: { students: studentId },
        $set: { modifiedAt: new Date() },
      }
    );

    await sendCoreMessage({
      subdomain: models.subdomain,
      action: "conformities.addConformities",
      data: {
        mainType: "customer",
        mainTypeId: studentId,
        relType: "classes",
        relTypeId: classId,
      },
    });

    return models.Classes.findOne({ _id: classId });
  },
};

export default classesMutation;
