import { generateModels, IModels } from "../connectionResolver"


export let models:IModels;


beforeAll(async()=>{

    models = await generateModels("os")


})