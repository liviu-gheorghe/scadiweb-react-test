const getUniqueValues = (arr) => {
    if(!arr) return arr;
    return arr.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
}


export {getUniqueValues};
