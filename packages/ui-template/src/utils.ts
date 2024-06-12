export const generateOptions = (array) => {
    const options = array.map(item => ({ value: item._id, label: item.name || item.title }))

    return options
}
