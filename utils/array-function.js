/**
 * 数组去重
 */
function arrayUnique(arr) {
  return [...new Set(arr)];
}

/**
 * 数组并集
 */
function arrayUnion(arr1, arr2) {
  return [... new Set([...arr1, ...arr2])];
}

/**
 * 数组交集
 */
function arrayIntersect(arr1, arr2) {
  return arr1.filter(item => {
    return arr2.includes(item);
  });
}

/**
 * 数组差集
 */
function arrayDifference(arr1, arr2) {
  let intersection = arrayIntersect(arr1, arr2);
  return arrayUnion(arr1, arr2).filter(item => {
    return !intersection.includes(item);
  });
}

/**
 * 一个对象组成的数组，查询每个对象是否存在某个键的值等于搜索的值
 */
function ifExistsInTwoDimArray(search, arr, key) {
  var include = false;
  arr.forEach(function (item, index) {
    if (item[key] == search) include = true;
  })
  return include;
}


// let arrayFunction = require('../../utils/array-function.js')
module.exports = {
  unique:     arrayUnique,
  union:      arrayUnion,
  intersect:  arrayIntersect,
  diff:       arrayDifference,
  ifExists:   ifExistsInTwoDimArray
}