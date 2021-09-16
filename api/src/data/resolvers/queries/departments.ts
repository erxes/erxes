import { Departments } from "../../../db/models"

const departmentQueries = {
    departments(_root) {
        return Departments.find()
    },

    departmentDetail(_root, { _id }) {
        return Departments.getDepartment({ _id });
    }
}

export default departmentQueries;