/**
 * Calculates the position on a canvas based on the given parameters.
 *
 * @param {number} i - The index of the position.
 * @param {number} position - The position in seconds.
 * @param {number} receptorPos - The position of the receptors on the canvas.
 * @param {number} bpm - The beats per minute.
 * @param {number} beatSnap - The beat snap value.
 * @param {number} scrollSpeed - The scroll speed value.
 * @param {number} [scale=1] - The scale value.
 * @return {number} The calculated position on the canvas.
 */
function getPosition(i, position, receptorPos, offset, bpm, beatSnap, scrollSpeed, rate = 1, scale = 1) {
    bpm = 3600 * 4 / bpm;
    const base = canvas.height - receptorPos;
    const pos = (position - offset / 1000) * 60 / bpm * 4;
    const index = i * scale / beatSnap;
    const y = base + (pos - index) * bpm / 60 * (scrollSpeed * (1 / rate));

    return y;
}