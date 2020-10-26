import _ from "lodash";
import cloneDeep from 'clone-deep';
import omitDeep from 'omit-deep';

let updateArrayByKey = (item, originalArray, identifier = '_id', upsert = false) => {
    let tempItem = Object.assign([], originalArray);

    let index = _.findIndex(tempItem, { [identifier]: item[identifier]});
    
    if(index == -1 && upsert)
        return insertIntoArray(item, originalArray);

    tempItem.splice(index, 1, item);
    return tempItem;
}

let insertIntoArray = (item, originalArray) => {
    let tempItem = Object.assign([], originalArray);
    tempItem.push(item);
    return tempItem;
}

let copyArrayReference = (reference) => {
    if(Array.isArray(reference))
        return Object.assign([], reference);
    return Object.assign({}, reference);
}

let translateGqlData = (data, property) => _.get(data, property);

let cleanGqlTypename = (obj) => deepClean(obj, '__typename');

let deepClean = (obj, prop) => omitDeep(cloneDeep(obj), prop);

export {
    updateArrayByKey,
    insertIntoArray,
    copyArrayReference,
    translateGqlData,
    cleanGqlTypename,
    deepClean
}