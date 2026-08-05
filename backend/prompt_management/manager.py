import os
import re
from typing import Dict, Any

# Resolve paths relative to this file's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SYSTEM_PROMPT_PATH = os.path.join(BASE_DIR, "system_prompt.txt")

def get_system_prompt() -> str:
    """Read the system prompt instructions from the text asset file."""
    with open(SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
        return f.read()

def get_template_instructions(template_id: str) -> str:
    """Read the template-specific instruction guidelines from file."""
    # Sanitize template_id to prevent path traversal
    safe_id = re.sub(r'[^a-zA-Z0-9_-]', '', template_id)
    path = os.path.join(BASE_DIR, "template_instructions", f"{safe_id}.txt")
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read().strip()
        except Exception as e:
            print(f"⚠️ Error reading template instructions for {safe_id}: {e}")
    return ""

def get_latex_template(template_id: str = "blue-line") -> str:
    """Read the LaTeX Jinja2 template from the tex asset file based on template_id."""
    if template_id == "gray-banner":
        filename = "gray_banner_template.tex"
    elif template_id == "minimal-classic":
        filename = "minimal_classic_template.tex"
    elif template_id == "elegant-beige":
        filename = "elegant_beige_template.tex"
    else:
        filename = "blue_line_template.tex"
    path = os.path.join(os.path.dirname(BASE_DIR), "tex_templates", filename)
    
    # Fallback to general template if specific one is missing
    if not os.path.exists(path):
        fallback_path = os.path.join(os.path.dirname(BASE_DIR), "tex_templates", "resume_template.tex")
        if os.path.exists(fallback_path):
            path = fallback_path
            
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def escape_latex(val: Any) -> str:
    """Safely escape special LaTeX control characters recursively to prevent build failures."""
    if val is None:
        return ""
    if isinstance(val, list):
        return ", ".join([escape_latex(x) for x in val if x])
    if isinstance(val, dict):
        return ", ".join([f"{k}: {escape_latex(v)}" for k, v in val.items() if v])
    
    text = str(val)
    replacements = {
        '\\': r'\textbackslash{}',
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
    }
    pattern = re.compile('|'.join(re.escape(key) for key in replacements.keys()))
    return pattern.sub(lambda match: replacements[match.group(0)], text)

# Jinja2 environment configuration
from jinja2 import Environment
jinja_env = Environment(
    comment_start_string='{#_jinja_comment_#}',
    comment_end_string='#_jinja_comment_#'
)
jinja_env.filters['latex'] = escape_latex

def render_latex_from_json(resume_json: Dict[str, Any], template_id: str = "blue-line") -> str:
    """Render a structured JSON object into a valid LaTeX markup using Jinja2."""
    template_str = get_latex_template(template_id)
    jinja_template = jinja_env.from_string(template_str)
    return jinja_template.render(**resume_json)
