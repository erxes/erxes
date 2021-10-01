import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Segments } from '../db/models';

dotenv.config();

const command = async () => {
  await connect();

  const segments = await Segments.find({ name: { $exists: true } });

  console.log(`segments count = ${segments.length}`);

  for (const segment of segments) {
    const conditions = segment.conditions;

    if (!conditions || conditions.length === 0) {
      return;
    }

    const contentType = segment.contentType as
      | 'customer'
      | 'company'
      | 'deal'
      | 'task'
      | 'task'
      | 'ticket'
      | 'form_submission'
      | 'conversation';

    for (const condition of conditions) {
      condition.propertyType = contentType;

      if (segment.boardId || segment.pipelineId) {
        condition.boardId = segment.boardId;
        condition.pipelineId = segment.pipelineId;
      }
    }

    const subSegment = await Segments.create({ contentType, conditions });

    const newConditions = [
      { type: 'subSegment', subSegmentId: subSegment._id }
    ];

    await Segments.updateOne(
      { _id: segment._id },
      { $set: { conditions: newConditions, conditionsConjunction: 'and' } }
    );
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
