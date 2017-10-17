import { Mongo } from 'meteor/mongo';
import Schemas from './schemas';


const Alerts = new Mongo.Collection(null);
Alerts.attachSchema(Schemas.Alerts);

const Collections = { Alerts };

export default Collections;
