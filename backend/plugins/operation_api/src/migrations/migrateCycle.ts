const { MongoClient } = require('mongodb');
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

console.log(MONGO_URL, 'MONGO_URL');

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const client = new MongoClient(MONGO_URL);

let db;
let COLLECTIONS;

const command = async () => {
  await client.connect();
  db = client.db();

  COLLECTIONS = {
    tasks: db.collection('operation_tasks'),
    teams: db.collection('operation_teams'),
    teamMembers: db.collection('operation_team_members'),
    statuses: db.collection('operation_statuses'),
    projects: db.collection('operation_projects'),
    notes: db.collection('operation_notes'),
    activities: db.collection('operation_activities'),
    cycles: db.collection('operation_cycles'),
  };

  try {
    const teamsCursor = COLLECTIONS.teams.find({});
    let teamCount = 0;

    for await (const team of teamsCursor) {
      teamCount++;
      console.log(
        `\n=== Processing Team #${teamCount}: ${team.name || 'Unnamed'} (${
          team._id
        }) ===`,
      );

      const UpcomingCycle = await COLLECTIONS.cycles.findOne({
        teamId: team._id,
        name: { $regex: /^Cycle 10\.2\s*$/ },
      });

      const OngoingCycle = await COLLECTIONS.cycles.findOne({
        teamId: team._id,
        name: { $regex: /^Cycle 10\.1\s*$/ },
      });

      if (!UpcomingCycle || !OngoingCycle) {
        console.log(
          `Skipping team ${team.name || team._id}: missing cycles (Upcoming=${
            UpcomingCycle?.name
          }, Ongoing=${OngoingCycle?.name})`,
        );
        continue;
      }

      console.log(
        `Found UpcomingCycle: ${UpcomingCycle.name} (${UpcomingCycle._id}), OngoingCycle: ${OngoingCycle.name} (${OngoingCycle._id})`,
      );

      const CycleActivities = await COLLECTIONS.activities
        .find({
          module: 'CYCLE',
          action: 'CHANGED',
          createdBy: 'system',
          'metadata.newValue': UpcomingCycle._id.toString(),
          'metadata.previousValue': OngoingCycle._id.toString(),
        })
        .toArray();

      console.log(
        `Team ${team.name}: Found ${CycleActivities.length} cycle activities`,
      );

      let updatedCount = 0;

      for (const activity of CycleActivities) {
        const res = await COLLECTIONS.tasks.updateOne(
          { _id: activity.contentId },
          { $set: { cycleId: OngoingCycle._id } },
        );

        if (res.modifiedCount > 0) {
          updatedCount++;
        }
      }

      const deleteRes = await COLLECTIONS.activities.deleteMany({
        module: 'CYCLE',
        action: 'CHANGED',
        createdBy: 'system',
        'metadata.newValue': UpcomingCycle._id.toString(),
        'metadata.previousValue': OngoingCycle._id.toString(),
      });

      console.log(`Deleted ${deleteRes.deletedCount} activities`);

      const updateUpcoming = await COLLECTIONS.cycles.updateOne(
        { _id: UpcomingCycle._id },
        { $set: { isActive: false, isCompleted: false } },
      );
      console.log(
        `Deactivated UpcomingCycle: ${UpcomingCycle.name} → matched ${updateUpcoming.matchedCount}, modified ${updateUpcoming.modifiedCount}`,
      );

      const updateOngoing = await COLLECTIONS.cycles.updateOne(
        { _id: OngoingCycle._id },
        {
          $set: { isActive: true, isCompleted: false, unFinishedTasks: [] },
          $unset: { statistics: 1 },
        },
      );
      console.log(
        `Activated OngoingCycle: ${OngoingCycle.name} → matched ${updateOngoing.matchedCount}, modified ${updateOngoing.modifiedCount}`,
      );
    }
  } catch (e) {
    console.error(`Error occurred: ${e.message}`, e);
  } finally {
    await client.close();
  }

  console.log(`\nProcess finished at: ${new Date().toISOString()}`);
};

command();

