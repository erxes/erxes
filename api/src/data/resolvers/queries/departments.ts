import { Departments } from "../../../db/models"

const departmentQueries = {
    async departments(_root, { perPage, page, ...doc }) {
        return {
            list: await Departments.find(doc),
            totalCount: await Departments.find(doc).countDocuments()
        }
    },

    departmentDetail(_root, { _id }) {
        return Departments.getDepartment({ _id });
    }
}

export default departmentQueries;