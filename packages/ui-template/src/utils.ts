export const generateOptions = (array) => {
    const options = array.map(item => ({ value: item._id, label: item.name || item.title }))

    return options
}

export const includesAny = (array1: string[], array2: string[] | string) => {
    if (Array.isArray(array2)) {
        return array2.some(item => array1.includes(item))
    }

    return array1.includes(array2)
}
