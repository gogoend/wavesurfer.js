/**
 * @since 3.0.0
 */

import style from './util/style';
import getId from './util/get-id';

/**
 * The `CanvasEntry` class represents an element consisting of a wave `canvas`
 * and an (optional) progress wave `canvas`.
 *
 * The `MultiCanvas` renderer uses one or more `CanvasEntry` instances to
 * render a waveform, depending on the zoom level.
 */
export default class CanvasEntry {
    constructor() {
        /**
         * The wave node
         *
         * @type {HTMLCanvasElement}
         */
        this.wave = null;
        /**
         * The wave canvas rendering context
         *
         * @type {CanvasRenderingContext2D}
         */
        this.waveCtx = null;
        /**
         * The (optional) progress wave node
         *
         * @type {HTMLCanvasElement}
         */
        this.progress = null;
        /**
         * The (optional) progress wave canvas rendering context
         *
         * @type {CanvasRenderingContext2D}
         */
        this.progressCtx = null;
        /**
         * Start of the area the canvas should render, between 0 and 1
         *
         * @type {number}
         */
        this.start = 0;
        /**
         * End of the area the canvas should render, between 0 and 1
         *
         * @type {number}
         */
        this.end = 1;
        /**
         * Unique identifier for this entry
         *
         * @type {string}
         */
        this.id = getId(
            typeof this.constructor.name !== 'undefined'
                ? this.constructor.name.toLowerCase() + '_'
                : 'canvasentry_'
        );
        /**
         * Canvas 2d context attributes
         *
         * @type {object}
         */
        this.canvasContextAttributes = {};
    }

    /**
     * Store the wave canvas element and create the 2D rendering context
     * 存储canvas元素以及获取到的canvas绘图环境
     *
     * @param {HTMLCanvasElement} element The wave `canvas` element.
     */
    initWave(element) {
        this.wave = element;
        this.waveCtx = this.wave.getContext('2d', this.canvasContextAttributes);
    }

    /**
     * Store the progress wave canvas element and create the 2D rendering
     * context
     *
     * @param {HTMLCanvasElement} element The progress wave `canvas` element.
     */
    initProgress(element) {
        this.progress = element;
        this.progressCtx = this.progress.getContext(
            '2d',
            this.canvasContextAttributes
        );
    }

    /**
     * Update the dimensions
     *
     * @param {number} elementWidth Width of the entry
     * @param {number} totalWidth Total width of the multi canvas renderer
     * @param {number} width The new width of the element
     * @param {number} height The new height of the element
     */
    updateDimensions(elementWidth, totalWidth, width, height) {
        // where the canvas starts and ends in the waveform, represented as a
        // decimal between 0 and 1
        this.start = this.wave.offsetLeft / totalWidth || 0;
        this.end = this.start + elementWidth / totalWidth;

        // set wave canvas dimensions
        this.wave.width = width;
        this.wave.height = height;
        let elementSize = { width: elementWidth + 'px' };
        style(this.wave, elementSize);

        if (this.hasProgressCanvas) {
            // set progress canvas dimensions
            this.progress.width = width;
            this.progress.height = height;
            style(this.progress, elementSize);
        }
    }

    /**
     * Clear the wave and progress rendering contexts
     * 清除绘制好的波形与进度条
     */
    clearWave() {
        // wave
        this.waveCtx.clearRect(
            0,
            0,
            this.waveCtx.canvas.width,
            this.waveCtx.canvas.height
        );

        // progress
        if (this.hasProgressCanvas) {
            this.progressCtx.clearRect(
                0,
                0,
                this.progressCtx.canvas.width,
                this.progressCtx.canvas.height
            );
        }
    }

    /**
     * Set the fill styles for wave and progress
     * @param {string|string[]} waveColor Fill color for the wave canvas,
     * or an array of colors to apply as a gradient
     * @param {?string|string[]} progressColor Fill color for the progress canvas,
     * or an array of colors to apply as a gradient
     */
    setFillStyles(waveColor, progressColor) {
        this.waveCtx.fillStyle = this.getFillStyle(this.waveCtx, waveColor);

        if (this.hasProgressCanvas) {
            this.progressCtx.fillStyle = this.getFillStyle(this.progressCtx, progressColor);
        }
    }

    /**
     * Utility function to handle wave color arguments
     * 获取颜色参数；如果传入的颜色是一个字符串，直接原样返回；如果是字符串数组，就返回渐变色
     *
     * When the color argument type is a string, it will be returned as is.
     * Otherwise, it will be treated as an array, and a canvas gradient will
     * be returned
     *
     * @since 5.3.0
     * @param {CanvasRenderingContext2D} ctx Rendering context of target canvas
     * @param {string|string[]} color Fill color for the wave canvas, or an array of colors to apply as a gradient
     * @returns {string|CanvasGradient} Returns a string fillstyle value, or a canvas gradient
     */
    getFillStyle(ctx, color) {
        if (typeof color == 'string') {
            return color;
        }

        const waveGradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        color.forEach((value, index) => waveGradient.addColorStop((index / color.length), value));

        return waveGradient;
    }

    /**
     * Set the canvas transforms for wave and progress
     * 设置peak图与进度条的变换
     *
     * @param {boolean} vertical Whether to render vertically
     */
    applyCanvasTransforms(vertical) {
        // 如果是垂直渲染，则需要对波形图做一些变换
        if (vertical) {
            // Reflect the waveform across the line y = -x
            // 沿着 ‘\’ 方向对称波形
            this.waveCtx.setTransform(0, 1, 1, 0, 0, 0);

            if (this.hasProgressCanvas) {
                this.progressCtx.setTransform(0, 1, 1, 0, 0, 0);
            }
        }
    }

    /**
     * Draw a rectangle for wave and progress
     *
     * @param {number} x X start position
     * @param {number} y Y start position
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} radius Radius of the rectangle
     */
    fillRects(x, y, width, height, radius) {
        this.fillRectToContext(this.waveCtx, x, y, width, height, radius);

        if (this.hasProgressCanvas) {
            this.fillRectToContext(
                this.progressCtx,
                x,
                y,
                width,
                height,
                radius
            );
        }
    }

    /**
     * Draw the actual rectangle on a `canvas` element
     *
     * @param {CanvasRenderingContext2D} ctx Rendering context of target canvas
     * @param {number} x X start position
     * @param {number} y Y start position
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} radius Radius of the rectangle
     */
    fillRectToContext(ctx, x, y, width, height, radius) {
        if (!ctx) {
            return;
        }

        if (radius) {
            this.drawRoundedRect(ctx, x, y, width, height, radius);
        } else {
            ctx.fillRect(x, y, width, height);
        }
    }

    /**
     * Draw a rounded rectangle on Canvas
     * 在canvas上绘制圆角矩形
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {number} x X-position of the rectangle
     * @param {number} y Y-position of the rectangle
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} radius Radius of the rectangle
     *
     * @return {void}
     * @example drawRoundedRect(ctx, 50, 50, 5, 10, 3)
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        if (height === 0) {
            return;
        }
        // peaks are float values from -1 to 1. Use absolute height values in
        // order to correctly calculate rounded rectangle coordinates
        if (height < 0) {
            height *= -1;
            y -= height;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
        );
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Render the actual wave and progress lines
     *
     * @param {number[]} peaks Array with peaks data
     * @param {number} absmax Maximum peak value (absolute)
     * @param {number} halfH Half the height of the waveform
     * @param {number} offsetY Offset to the top
     * @param {number} start The x-offset of the beginning of the area that
     * should be rendered
     * @param {number} end The x-offset of the end of the area that
     * should be rendered
     */
    drawLines(peaks, absmax, halfH, offsetY, start, end) {
        // 绘制peak本身
        this.drawLineToContext(
            this.waveCtx,
            peaks,
            absmax,
            halfH,
            offsetY,
            start,
            end
        );

        // 绘制进度条
        if (this.hasProgressCanvas) {
            this.drawLineToContext(
                this.progressCtx,
                peaks,
                absmax,
                halfH,
                offsetY,
                start,
                end
            );
        }
    }

    /**
     * Render the actual waveform line on a `canvas` element
     * drawLine过程中，CanvasContext 相关API都在此被调用
     *
     * @param {CanvasRenderingContext2D} ctx Rendering context of target canvas
     * @param {number[]} peaks Array with peaks data
     * @param {number} absmax Maximum peak value (absolute)
     * @param {number} halfH Half the height of the waveform
     * @param {number} offsetY Offset to the top
     * @param {number} start The x-offset of the beginning of the area that
     * should be rendered
     * @param {number} end The x-offset of the end of the area that
     * should be rendered
     */
    drawLineToContext(ctx, peaks, absmax, halfH, offsetY, start, end) {
        if (!ctx) {
            return;
        }

        // length是peaks数组长度的一半
        const length = peaks.length / 2;
        const first = Math.round(length * this.start);

        // use one more peak value to make sure we join peaks at ends -- unless,
        // of course, this is the last canvas
        const last = Math.round(length * this.end) + 1;

        const canvasStart = first;
        const canvasEnd = last;
        const scale = this.wave.width / (canvasEnd - canvasStart - 1);

        // optimization
        const halfOffset = halfH + offsetY;
        const absmaxHalf = absmax / halfH;

        ctx.beginPath();
        ctx.moveTo((canvasStart - first) * scale, halfOffset);

        ctx.lineTo(
            (canvasStart - first) * scale,
            halfOffset - Math.round((peaks[2 * canvasStart] || 0) / absmaxHalf)
        );

        // 其实波形是一个闭合的形状，而不是一根线
        // 绘制波形的上边缘
        let i, peak, h;
        for (i = canvasStart; i < canvasEnd; i++) {
            peak = peaks[2 * i] || 0;
            h = Math.round(peak / absmaxHalf); // 当前波形对应到canvas上的高度
            ctx.lineTo((i - first) * scale + this.halfPixel, halfOffset - h);
        }

        // 上边缘绘制结束后，从后面绕过来继续绘制下边缘
        // draw the bottom edge going backwards, to make a single
        // closed hull to fill
        let j = canvasEnd - 1;
        for (j; j >= canvasStart; j--) {
            peak = peaks[2 * j + 1] || 0;
            h = Math.round(peak / absmaxHalf);
            ctx.lineTo((j - first) * scale + this.halfPixel, halfOffset - h);
        }

        ctx.lineTo(
            (canvasStart - first) * scale,
            halfOffset -
            Math.round((peaks[2 * canvasStart + 1] || 0) / absmaxHalf)
        );

        // 下半部分绘制结束后，关闭路径，并填色
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Destroys this entry
     * 销毁该entry
     */
    destroy() {
        this.waveCtx = null;
        this.wave = null;

        this.progressCtx = null;
        this.progress = null;
    }

    /**
     * Return image data of the wave `canvas` element
     *
     * When using a `type` of `'blob'`, this will return a `Promise` that
     * resolves with a `Blob` instance.
     *
     * @param {string} format='image/png' An optional value of a format type.
     * @param {number} quality=0.92 An optional value between 0 and 1.
     * @param {string} type='dataURL' Either 'dataURL' or 'blob'.
     * @return {string|Promise} When using the default `'dataURL'` `type` this
     * returns a data URL. When using the `'blob'` `type` this returns a
     * `Promise` that resolves with a `Blob` instance.
     */
    getImage(format, quality, type) {
        if (type === 'blob') {
            return new Promise(resolve => {
                this.wave.toBlob(resolve, format, quality);
            });
        } else if (type === 'dataURL') {
            return this.wave.toDataURL(format, quality);
        }
    }
}
