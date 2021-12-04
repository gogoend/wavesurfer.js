import reqAnimationFrame from './request-animation-frame';

/**
 * Create a function which will be called at the next requestAnimationFrame
 * cycle
 * 创建一个在下次requestAnimationFrame循环中将会被调用的函数
 *
 * @param {function} func The function to call
 *
 * @return {func} The function wrapped within a requestAnimationFrame
 */
export default function frame(func) {
    return (...args) => reqAnimationFrame(() => func(...args));
}
