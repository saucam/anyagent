"""Build architecture.svg for the anyagent README.

Follows the shared fig standard (see posts/.../fig_architecture.py): hand-authored
SVG, ui-sans-serif body, ui-monospace for paths, rounded-rect boxes with the
shared palette, named arrow markers in <defs>, plus a green summary banner.

"One source -> many targets": a .claude/ Claude Code workspace fanning out
through `anyagent sync` into Codex, Gemini, Cursor, and Hermes.

Outputs: architecture.svg
PNG (@2x) rendered separately via headless Chrome (see the build step / README).
"""

from __future__ import annotations

# --- Shared palette (matches the streaming_softmax / vllm_mrv2 figs) ----------
TEXT  = "#1F2933"
MUTED = "#6B7280"
DIM   = "#9CA3AF"
GRID  = "#E5E7EB"

BLUE_FILL,  BLUE_STROKE,  BLUE_TEXT  = "#E2ECF6", "#2C5F8C", "#2C5F8C"
PEACH_FILL, PEACH_STROKE, PEACH_TEXT = "#FCEFE7", "#C26A4F", "#7A3E2B"
GREEN_FILL, GREEN_STROKE, GREEN_TEXT = "#F0F6F1", "#4A8054", "#3F6E48"

SRC_BG  = "#F6F9FC"
TGT_BG  = "#FDF8F5"
BANNER_FILL, BANNER_ST = "#F0F6F1", "#4A8054"

W, H = 1400, 720

# --- Helpers ------------------------------------------------------------------
def rect(x, y, w, h, fill, stroke, rx=8, sw=1.5):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

def text(x, y, s, size=14, color=TEXT, weight="500", anchor="middle",
         family="ui-sans-serif, system-ui, sans-serif"):
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" '
            f'font-weight="{weight}" text-anchor="{anchor}" '
            f'font-family="{family}">{s}</text>')

def mono(x, y, s, size=12, color=TEXT, anchor="middle"):
    return text(x, y, s, size=size, color=color, weight="500", anchor=anchor,
                family="ui-monospace, SFMono-Regular, Consolas, monospace")

def box(x, y, w, h, lines, kind="blue", highlighted=False):
    if kind == "blue":   f, s, t = BLUE_FILL, BLUE_STROKE, BLUE_TEXT
    elif kind == "peach":f, s, t = PEACH_FILL, PEACH_STROKE, PEACH_TEXT
    else:                f, s, t = GREEN_FILL, GREEN_STROKE, GREEN_TEXT
    sw = 2.6 if highlighted else 1.5
    out = [rect(x, y, w, h, f, s, sw=sw)]
    cx = x + w / 2
    n = len(lines)
    lh = 19
    top = y + h / 2 - (n - 1) * lh / 2 + 5
    for i, (txt, fnt) in enumerate(lines):
        cy = top + i * lh
        if fnt == "mono":
            out.append(mono(cx, cy, txt, size=12.5, color=t))
        elif fnt == "label":
            out.append(text(cx, cy, txt, size=14, color=t, weight="700"))
        else:
            out.append(text(cx, cy, txt, size=13, color=t, weight="600"))
    return "\n".join(out)

def arrow(d, color=MUTED, sw=1.6, marker="grey"):
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'marker-end="url(#arrow-{marker})"/>')

# --- SVG <defs> markers -------------------------------------------------------
markers = f"""
  <marker id="arrow-grey" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{MUTED}"/>
  </marker>
  <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{BLUE_STROKE}"/>
  </marker>
  <marker id="arrow-peach" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{PEACH_STROKE}"/>
  </marker>
"""

# --- Composition --------------------------------------------------------------
parts = []
parts.append(f'<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
             f'xmlns="http://www.w3.org/2000/svg" '
             f'font-family="ui-sans-serif, system-ui, sans-serif" fill="{TEXT}">')
parts.append("<defs>" + markers + "</defs>")
parts.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#FFFFFF"/>')

# --- Title block --------------------------------------------------------------
parts.append(text(W / 2, 44, "Write your agent setup once. Run it in any agent.",
                  size=22, weight="700", color=TEXT))
parts.append(text(W / 2, 73,
                  "anyagent bridges one Claude Code .claude/ workspace into Codex, Gemini, Cursor, and Hermes.",
                  size=13, color=MUTED, weight="500"))

# --- Section headers ----------------------------------------------------------
parts.append(text(230, 116, "SOURCE  ·  CLAUDE CODE", size=11, weight="700",
                  color=BLUE_STROKE))
parts.append(text(1119, 116, "TARGETS  ·  OTHER AGENTS", size=11, weight="700",
                  color=PEACH_STROKE))

# --- Section backgrounds ------------------------------------------------------
parts.append(rect(50, 132, 360, 430, SRC_BG, GRID, rx=14, sw=1.4))
parts.append(rect(880, 132, 478, 430, TGT_BG, GRID, rx=14, sw=1.4))

# --- Source column ------------------------------------------------------------
parts.append(box(85, 165, 290, 150,
                 [(".claude/", "label"),
                  ("skills/", "mono"),
                  ("agents/", "mono"),
                  ("settings.json", "mono")],
                 kind="blue", highlighted=True))
parts.append(box(85, 345, 290, 62,
                 [("CLAUDE.md", "mono"),
                  ("repo-root guide", "small")],
                 kind="blue"))

# --- anyagent sync pill (the one command) -------------------------------------
parts.append(rect(455, 329, 182, 44, "#EAF2FA", BLUE_STROKE, rx=22, sw=2.2))
parts.append(mono(546, 356, "anyagent sync", size=13.5, color=BLUE_TEXT))

# source -> pill (both source artifacts feed the one command)
parts.append(arrow("M 377 240 C 422 240, 432 351, 451 351",
                   color=BLUE_STROKE, marker="blue", sw=1.7))
parts.append(arrow("M 377 374 C 422 374, 432 351, 451 351",
                   color=BLUE_STROKE, marker="blue", sw=1.7))

# --- Target column ------------------------------------------------------------
TX, TW = 900, 440
parts.append(box(TX, 150, TW, 96,
                 [("Codex", "label"),
                  (".agents/skills/", "mono"),
                  (".codex/agents/*.toml", "mono"),
                  ("AGENTS.md", "mono")],
                 kind="peach"))
parts.append(box(TX, 262, TW, 96,
                 [("Gemini", "label"),
                  (".gemini/skills/", "mono"),
                  (".gemini/agents/*.md", "mono"),
                  ("GEMINI.md", "mono")],
                 kind="peach"))
parts.append(box(TX, 374, TW, 64,
                 [("Cursor", "label"),
                  (".cursor/rules/*.mdc", "mono")],
                 kind="peach"))
parts.append(box(TX, 454, TW, 74,
                 [("Hermes", "label"),
                  (".hermes/WORKSPACE.md", "mono")],
                 kind="peach"))

# --- Fan-out arrows: pill -> each target --------------------------------------
parts.append(arrow("M 639 346 C 762 300, 800 198, 896 198",
                   color=PEACH_STROKE, marker="peach", sw=1.8))
parts.append(arrow("M 639 350 C 772 332, 800 310, 896 310",
                   color=PEACH_STROKE, marker="peach", sw=1.8))
parts.append(arrow("M 639 354 C 772 384, 800 406, 896 406",
                   color=PEACH_STROKE, marker="peach", sw=1.8))
parts.append(arrow("M 639 358 C 762 424, 800 491, 896 491",
                   color=PEACH_STROKE, marker="peach", sw=1.8))

# --- Summary banner -----------------------------------------------------------
parts.append(rect(50, 600, 1308, 92, BANNER_FILL, BANNER_ST, rx=14, sw=2.2))
parts.append(text(W / 2, 630, "EDIT ONCE", size=11.5, weight="700",
                  color=GREEN_STROKE))
parts.append(text(W / 2, 658, "Edit once. Every agent stays in sync.",
                  size=17, weight="700", color=GREEN_TEXT))
parts.append(text(W / 2, 680,
                  "anyagent sync regenerates every target from the source; anyagent check flags drift.",
                  size=12.5, weight="500", color=GREEN_TEXT))

parts.append("</svg>")

with open("architecture.svg", "w") as f:
    f.write("\n".join(parts))
print("wrote architecture.svg")
