import base64

def grid_to_svg(grid_str, scale=2):
    lines = [line.strip() for line in grid_str.strip().split('\n') if line.strip()]
    height = len(lines)
    width = len(lines[0])
    
    colors = {
        'b': '#000000',
        'c': '#00FFFF', # Cyan
        'w': '#FFFFFF',
        'd': '#0EA5E9', # Darker Cyan for sword
        'y': '#FBBF24', # Gold crossguard
        'h': '#92400E', # Brown handle
    }
    
    rects = []
    for y, line in enumerate(lines):
        line = line.replace(' ', '')
        for x, char in enumerate(line):
            if char in colors:
                rects.append(f'<rect x="{x*scale}" y="{y*scale}" width="{scale}" height="{scale}" fill="{colors[char]}"/>')
                
    svg_width = width * scale
    svg_height = height * scale
    
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{svg_width}" height="{svg_height}" viewBox="0 0 {svg_width} {svg_height}">'
    svg += "".join(rects)
    svg += "</svg>"
    
    # encode for direct use in css
    encoded = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{encoded}"

default_cursor = """
b b . . . . . . . . . .
b c b . . . . . . . . .
b c c b . . . . . . . .
b c c c b . . . . . . .
b c c c c b . . . . . .
b c c c c c b . . . . .
b c c c c c c b . . . .
b c c c c c c c b . . .
b c c c c c c c c b . .
b c c c c c b b b b b .
b c c b c c b . . . . .
b c b . b c c b . . . .
b b . . b c c b . . . .
. . . . . b c c b . . .
. . . . . b c c b . . .
. . . . . . b b . . . .
"""

# Sword pointing top-left (0,0) so the tip is the click point.
sword_cursor = """
b b b . . . . . . . . . . . . .
b c d b . . . . . . . . . . . .
b d c d b . . . . . . . . . . .
. b d c d b . . . . . . . . . .
. . b d c d b . . . . . . . . .
. . . b d c d b . . . . . . . .
. . . . b d c d b . . . b b . .
. . . . . b d c d b . b y y b .
. . . . . . b d c d b y h y b .
. . . . . . . b d c d b y b . .
. . . . . . . . b d c d b . . .
. . . . . . . b y h y b h b . .
. . . . . . b y y b y b h b . .
. . . . . . b b b . b b h b . .
. . . . . . . . . . . b b . . .
"""

dc_b64 = grid_to_svg(default_cursor, 2)
sc_b64 = grid_to_svg(sword_cursor, 2)

css = f'''
* {{
  cursor: url("{dc_b64}") 0 0, auto !important;
}}

button, a, .btn, .chip, .hr-mode-opt, .fi, .tb, .card, select, input[type="text"] {{
  cursor: url("{sc_b64}") 0 0, pointer !important;
}}
'''

with open("tmp_css.txt", "w") as f:
    f.write(css)
