const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let RiskAssessments;
let RiskFormSubmissions;
let RiskAssessmentIndicators;
let Indicators;
let FormFields;

const getOptionsValues = optionsValues => {
  return optionsValues
    .split('\n')
    .map(item => {
      if (item.match(/=/g)) {
        const label = item?.substring(0, item.indexOf('=')).trim();
        const value = Number(
          item.substring(item?.indexOf('=') + 1, item.length)
        );
        if (!Number.isNaN(value)) {
          return { label, value };
        }
      }
    }, [])
    .filter(item => item);
};

const calculateFormResponses = async ({
  responses,
  fields,
  calculateMethod,
  generalcalculateMethod
}) => {
  let sumNumber = 0;
  let scoreAviable = 0;

  if (calculateMethod === 'Multiply') {
    sumNumber = 1;
  }

  for (const [key, response] of Object.entries(responses)) {
    const field = fields.find(field => field._id === key);

    if (field?.optionsValues) {
      const optValues = getOptionsValues(field?.optionsValues);

      if (generalcalculateMethod === 'ByPercent') {
        const scores = optValues.map(option => option.value);
        scoreAviable += Math.max(...scores);
      }

      const fieldValue = optValues.find(
        option => option.label.trim() === String(response.value).trim()
      );
      switch (calculateMethod) {
        case 'Multiply':
          sumNumber *= Number(fieldValue?.value || 0);
          break;
        case 'Addition':
        case 'Average':
        case 'ByPercent':
          sumNumber += Number(fieldValue?.value || 0);
          break;
      }
    } else {
      if (typeof response.value === 'number') {
        sumNumber += response.value;
      }
    }
  }

  if (calculateMethod === 'Average') {
    const fieldCount = fields?.length || 1;
    sumNumber = sumNumber / fieldCount;
  }
  return { sumNumber, scoreAviable };
};

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);

  await client.connect();

  console.log('connected...');
  db = client.db();

  RiskAssessments = db.collection('risk_assessments');
  RiskFormSubmissions = db.collection('risk_form_submissions');
  RiskAssessmentIndicators = db.collection('risk_assessment_indicators');
  Indicators = db.collection('risk_indicators');
  FormFields = db.collection('form_fields');

  const submissions = await RiskFormSubmissions.aggregate([
    {
      $group: {
        _id: {
          assessmentId: '$assessmentId',
          value: '$value',
          formId: '$formId',
          fieldId: '$fieldId',
          indicatorId: '$indicatorId',
          userId: '$userId',
          cardId: '$cardId'
        },
        ids: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }
  ]).toArray();

  const idsForRemove = [];
  const reCalculateAssessmentIds = [];
  const indicatorIds = [];

  for (const submission of submissions) {
    submission.ids.shift();
    const { _id: doc, ids } = submission || {};

    idsForRemove.push(...ids);
    reCalculateAssessmentIds.push(doc.assessmentId);
    indicatorIds.push(doc.indicatorId);
  }

  console.log(`${submissions.length}:submission duplicated`);

  await RiskFormSubmissions.deleteMany({ _id: { $in: idsForRemove } });

  console.log('removed duplicated submissions');

  const assessmentsWithMultiple = await RiskAssessments.find({
    _id: { $in: reCalculateAssessmentIds }
  }).toArray();

  const miscalculated = await RiskAssessments.find({
    _id: { $nin: reCalculateAssessmentIds },
    resultScore: { $gt: 100 }
  }).toArray();

  const indicators = await Indicators.find({
    _id: {
      $in: [
        ...new Set(indicatorIds),
        ...new Set(miscalculated.map(({ indicatorId }) => indicatorId))
      ]
    }
  }).toArray();

  const progressBarLength = 100;
  let index = 0;

  let single = 0;
  let multiple = 0;
  let totalModified = 0;

  const assessments = [...assessmentsWithMultiple, ...miscalculated];

  for (const assessment of assessments) {
    const { indicatorId } = assessment || {};
    const indicator = indicators.find(({ _id }) => _id === indicatorId);
    try {
      if (indicator) {
        let resultSumNumber = 0;
        let totalCount = 0;
        let totalPercent = 0;
        let maxScoreAviable = 0;
        const forms = indicator?.forms;
        const calculateMethod = indicator?.calculateMethod;
        const formIds = (forms || [])?.map(form => form.formId);

        const fields = await FormFields.find({
          contentType: 'form',
          contentTypeId: { $in: formIds || [] }
        }).toArray();

        let formSubmissions = {};

        const submissions = await RiskFormSubmissions.find({
          assessmentId: assessment._id,
          indicatorId
        }).toArray();

        for (const submission of submissions) {
          formSubmissions[submission.fieldId] = { value: submission.value };
        }

        if (forms?.length === 1) {
          single += 1;
          if (forms[0]?.calculateMethod) {
            const { sumNumber, scoreAviable } = await calculateFormResponses({
              responses: formSubmissions,
              fields,
              calculateMethod: forms[0].calculateMethod,
              generalcalculateMethod: forms[0].calculateMethod
            });

            resultSumNumber =
              forms[0].calculateMethod === 'ByPercent'
                ? Number(((sumNumber / scoreAviable) * 100).toFixed(1))
                : sumNumber;

            totalModified += 1;

            await RiskAssessmentIndicators.updateOne(
              { assessmentId: assessment._id, indicatorId },
              { $set: { totalScore: resultSumNumber } }
            );
            await RiskAssessments.updateOne(
              { _id: assessment._id },
              {
                $set: {
                  totalScore: resultSumNumber,
                  resultScore: resultSumNumber
                }
              }
            );
          }
        }
        if (forms?.length && forms.length > 1) {
          multiple += 1;
          for (const form of forms) {
            const fieldIds = fields
              .filter(field => field.contentTypeId === form.formId)
              .map(field => field._id.toString());
            const responses = {};

            for (const [key, value] of Object.entries(formSubmissions)) {
              if (fieldIds.includes(key)) {
                responses[key] = value;
              }
            }

            const { sumNumber, scoreAviable } = await calculateFormResponses({
              responses: responses,
              fields,
              calculateMethod: form.calculateMethod,
              generalcalculateMethod: calculateMethod
            });
            const formPercentWeight = form.percentWeight || 0;
            totalCount += Number(
              (sumNumber * (formPercentWeight / 100)).toFixed(2)
            );
            totalPercent += formPercentWeight / 100;
            maxScoreAviable += Number(
              (scoreAviable * (formPercentWeight / 100)).toFixed(2)
            );
          }

          switch (calculateMethod) {
            case 'ByPercent':
              totalCount = Number(
                ((totalCount / maxScoreAviable) * (totalPercent * 100)).toFixed(
                  1
                )
              );
              resultSumNumber = totalCount;
              break;
            default:
              totalCount = totalCount / totalPercent;
              resultSumNumber = totalCount;
          }

          totalModified += 1;

          await RiskAssessmentIndicators.updateOne(
            {
              assessmentId: assessment._id,
              indicatorId
            },
            { $set: { totalScore: totalCount, resultScore: totalCount } }
          );

          await RiskAssessments.updateOne(
            {
              _id: assessment._id
            },
            { $set: { totalScore: totalCount, resultScore: totalCount } }
          );
        }

        const progress = index / assessments.length;
        const filledLength = Math.round(progressBarLength * progress);
        const emptyLength = progressBarLength - filledLength;
        const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
        index += 1;

        console.log(`[${bar}] ${(progress * 100).toFixed(2)}%`);
      } else {
        console.log(`assessmentId with ${assessment._id} indicator not found`);
      }
    } catch (error) {
      console.log({ error: error.message, assessment });
    }
  }

  console.log({ single, multiple });
  console.log(`Total assessment ${assessments.length}`);
  console.log(`Miscalculated result count: ${miscalculated.length}`);
  console.log(
    `calculated multiple times assessment count: ${assessmentsWithMultiple.length}`
  );

  console.log(`Total modified:${totalModified}`);

  console.log('\nProcess complete!');

  process.exit();
};

command();
