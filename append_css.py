import os

main_css_path = "./frontend/src/styles/main.css"
tmp_css_path = "./tmp_css.txt"

with open(tmp_css_path, "r", encoding="utf-8") as f:
    cursor_css = f.read()

particle_css = """
/* Click Particles */
.click-particle {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  border-radius: 1px;
  animation: explode 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes explode {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0) rotate(45deg); opacity: 0; }
}
"""

with open(main_css_path, "a", encoding="utf-8") as f:
    f.write("\n/* Custom Cursors */\n")
    f.write(cursor_css)
    f.write(particle_css)

print("CSS appended successfully.")
