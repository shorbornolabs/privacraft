import zlib
import struct
import os
import math

def write_png(filename, width, height, pixels):
    """
    Writes RGBA pixels to a PNG file using only standard library (zlib, struct).
    pixels: list of (R, G, B, A) tuples of length width * height
    """
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            idx = y * width + x
            r, g, b, a = pixels[idx]
            raw_data.extend([r, g, b, a])

    compressed = zlib.compress(bytes(raw_data), 9)

    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack(">I", len(data)) + c + struct.pack(">I", crc)

    png = bytearray(b"\x89PNG\r\n\x1a\n")
    # IHDR
    png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)))
    # IDAT
    png.extend(chunk(b"IDAT", compressed))
    # IEND
    png.extend(chunk(b"IEND", b""))

    with open(filename, "wb") as f:
        f.write(png)

def draw_icon(size):
    """
    Renders a modern sleek shield/padlock cyber icon on a rounded squircle gradient background.
    """
    pixels = []
    center = size / 2.0
    radius = size * 0.44
    corner_r = size * 0.22

    for y in range(size):
        for x in range(size):
            # Distance for rounded squircle
            dx = abs(x - center + 0.5)
            dy = abs(y - center + 0.5)
            
            # Rounded rectangle shape
            qx = max(0.0, dx - (center - corner_r))
            qy = max(0.0, dy - (center - corner_r))
            dist_sq = math.sqrt(qx * qx + qy * qy)
            inside = (dx <= center and dy <= center and dist_sq <= corner_r)

            if not inside:
                pixels.append((0, 0, 0, 0))
                continue

            # Normalized coords -1 to 1
            nx = (x - center) / center
            ny = (y - center) / center
            
            # Subtle gradient background: Deep Indigo/Blue to Electric Violet
            t = (nx + ny + 1.4) / 2.8
            t = max(0.0, min(1.0, t))
            
            # Base gradient: #0f172a to #3b82f6 / #8b5cf6
            bg_r = int(15 * (1 - t) + 79 * t)
            bg_g = int(23 * (1 - t) + 70 * t)
            bg_b = int(42 * (1 - t) + 229 * t)
            
            # Draw a sleek Lock symbol in center
            # Body: rect centered at (0, 0.15) with width 0.44, height 0.36
            # Shackle: arch centered at (0, -0.08) with radius 0.2, thickness 0.08
            
            is_lock = False
            lock_accent = False
            
            # Shackle
            shackle_cx = 0.0
            shackle_cy = -0.06
            sh_r = math.sqrt((nx - shackle_cx)**2 + (ny - shackle_cy)**2)
            if sh_r >= 0.12 and sh_r <= 0.22 and ny <= shackle_cy + 0.02:
                is_lock = True
            elif abs(nx - shackle_cx) <= 0.22 and abs(nx - shackle_cx) >= 0.12 and ny > shackle_cy and ny <= 0.08:
                is_lock = True
                
            # Lock body
            if abs(nx) <= 0.26 and ny >= 0.04 and ny <= 0.42:
                is_lock = True
                # Keyhole
                kh_dist = math.sqrt(nx**2 + (ny - 0.20)**2)
                if kh_dist <= 0.06:
                    is_lock = False
                elif abs(nx) <= 0.025 and ny >= 0.20 and ny <= 0.32:
                    is_lock = False
                elif kh_dist <= 0.09:
                    lock_accent = True

            # Highlight spark / star in top-right
            spark_dx = nx - 0.36
            spark_dy = ny - (-0.36)
            spark_dist = math.sqrt(spark_dx**2 + spark_dy**2)
            is_spark = (spark_dist < 0.09 and (abs(spark_dx) < 0.025 or abs(spark_dy) < 0.025))

            if is_spark:
                pixels.append((56, 189, 248, 255)) # Cyan glow
            elif is_lock:
                if lock_accent:
                    pixels.append((59, 130, 246, 255)) # Blue accent
                else:
                    pixels.append((255, 255, 255, 255)) # Crisp White
            else:
                # Border glow
                border_dist = corner_r - dist_sq
                if border_dist < 1.2:
                    pixels.append((99, 102, 241, 240))
                else:
                    pixels.append((bg_r, bg_g, bg_b, 255))

    return pixels

def main():
    os.makedirs("icons", exist_ok=True)
    for size in [16, 48, 128]:
        pixels = draw_icon(size)
        path = os.path.join("icons", f"icon-{size}.png")
        write_png(path, size, size, pixels)
        print(f"Generated {path} ({size}x{size})")

if __name__ == "__main__":
    main()
