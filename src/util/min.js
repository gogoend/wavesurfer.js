/**
 * Get the smallest value
 * 返回对象中某个key对应的最小值
 *
 * @param   {Array} values Array of numbers
 * @returns {Number} Smallest number found
 * @example console.log(min([1, 2, 3])); // logs 1
 */
export default function min(values) {
    let smallest = Number(Infinity);
    Object.keys(values).forEach(i => {
        if (values[i] < smallest) {
            smallest = values[i];
        }
    });
    return smallest;
}
