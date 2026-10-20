/** The preview uses a stable scale; the document model always remains in inches. */
export const PIXELS_PER_INCH = 96;
export const inchesToPixels = (inches: number) => inches * PIXELS_PER_INCH;
export const pixelsToInches = (pixels: number) => pixels / PIXELS_PER_INCH;
export const formatInches = (inches: number) => `${inches.toFixed(2)} in`;
