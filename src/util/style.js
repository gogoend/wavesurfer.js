/**
 * Apply a map of styles to an element
 * 应用一些样式到一个元素
 *
 * @param {HTMLElement} el The element that the styles will be applied to
 * @param {Object} styles The map of propName: attribute, both are used as-is
 *
 * @return {HTMLElement} el
 */
export default function style(el, styles) {
    Object.keys(styles).forEach(prop => {
        if (el.style[prop] !== styles[prop]) {
            el.style[prop] = styles[prop];
        }
    });
    return el;
}
