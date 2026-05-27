
export function parseColor(hex) {
    if (hex > 0xffffff) {
        return { color: hex >>> 8, alpha: (hex & 0xff) / 255 };
    }
    return { color: hex, alpha: 1 };
}
