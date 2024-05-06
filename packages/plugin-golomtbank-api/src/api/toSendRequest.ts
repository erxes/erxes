
import { Builder, parseString } from 'xml2js';
//api connect
//to save request
 sent
export class tosentRequest {


}

async function toJson(xml: string) {
return new Promise(resolveOuter => {
    return parseString(xml, { explicitArray: false }, (_, result) => {
    resolveOuter(result);
    });
});
}

async function toXML(json: any) {
const builder = await new Builder();
const xml = await builder.buildObject(json);
return xml;
}