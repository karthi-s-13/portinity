import os
import subprocess
import tempfile
import shutil
from fastapi import HTTPException

def compile_latex_to_pdf(latex_code: str) -> bytes:
    """
    Compiles LaTeX code to a PDF binary using either pdflatex or tectonic.
    Ensures security by using a temp directory and disabling shell escape.
    
    :param latex_code: Raw LaTeX markup code string
    :return: Bytes of the generated PDF file
    :raises HTTPException: If compilation fails or both compilers are missing
    """
    pdflatex_path = shutil.which("pdflatex")
    tectonic_path = shutil.which("tectonic")

    if not pdflatex_path and not tectonic_path:
        raise HTTPException(
            status_code=500,
            detail="No LaTeX compiler found on the server. Please install pdflatex (via MiKTeX or TeX Live) or tectonic (via winget install Tectonic)."
        )

    # Use a secure temp directory
    with tempfile.TemporaryDirectory() as temp_dir:
        tex_path = os.path.join(temp_dir, "resume.tex")
        pdf_path = os.path.join(temp_dir, "resume.pdf")
        log_path = os.path.join(temp_dir, "resume.log")

        # Write latex code to file
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_code)

        if pdflatex_path:
            # Run pdflatex with safety flags
            try:
                result = subprocess.run(
                    [
                        "pdflatex",
                        "-interaction=nonstopmode",
                        "-no-shell-escape",
                        f"-output-directory={temp_dir}",
                        tex_path
                    ],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=30 # Prevent long hangs
                )
            except subprocess.TimeoutExpired:
                raise HTTPException(
                    status_code=500,
                    detail="LaTeX compilation timed out after 30 seconds."
                )

            if result.returncode != 0:
                # Try to read the log to extract errors
                log_content = ""
                if os.path.exists(log_path):
                    try:
                        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
                            log_lines = f.readlines()
                            error_lines = [line.strip() for line in log_lines if line.startswith("!")]
                            log_content = "\n".join(error_lines) if error_lines else "".join(log_lines[-20:])
                    except Exception:
                        log_content = "Failed to parse log file."
                
                raise HTTPException(
                    status_code=400,
                    detail=f"LaTeX compilation failed with exit code {result.returncode}.\nErrors:\n{log_content}"
                )

        else:
            # Run tectonic
            try:
                result = subprocess.run(
                    [
                        "tectonic",
                        "--outdir", temp_dir,
                        tex_path
                    ],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=60 # Tectonic may need extra time on first run to fetch packages
                )
            except subprocess.TimeoutExpired:
                raise HTTPException(
                    status_code=500,
                    detail="Tectonic compilation timed out after 60 seconds."
                )

            if result.returncode != 0:
                # Capture tectonic errors from stdout/stderr
                log_content = result.stderr if result.stderr.strip() else result.stdout
                raise HTTPException(
                    status_code=400,
                    detail=f"Tectonic compilation failed with exit code {result.returncode}.\nErrors:\n{log_content}"
                )

        if not os.path.exists(pdf_path):
            raise HTTPException(
                status_code=500,
                detail="LaTeX compilation finished but PDF was not generated."
            )

        # Read PDF binary
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        return pdf_bytes
