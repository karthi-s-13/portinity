import asyncio
import os
from pyppeteer import launch
from fastapi import HTTPException

# Global browser instance that gets reused to save resources
_browser = None
_lock = asyncio.Lock()

def find_chrome_executable():
    """Finds Google Chrome, MS Edge, or Brave executable path on Windows or Linux."""
    paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%USERPROFILE%\AppData\Local\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
    ]
    for path in paths:
        if os.path.exists(path):
            return path
    return None

async def get_browser():
    """Returns a shared Pyppeteer browser instance using local Chrome/Edge if available."""
    global _browser
    async with _lock:
        if _browser is None:
            executable_path = find_chrome_executable()
            launch_args = {
                'headless': True,
                'args': [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            }
            if executable_path:
                launch_args['executablePath'] = executable_path
                print(f"Using system browser: {executable_path}")
            else:
                print("No system browser found, falling back to pyppeteer default")
            
            _browser = await launch(**launch_args)
        return _browser

async def compile_html_to_pdf(html_content: str) -> bytes:
    """
    Renders the provided HTML string in a headless Chromium browser and prints it to PDF.
    
    :param html_content: Self-contained HTML string with styling
    :return: Bytes of the generated PDF document
    """
    browser = await get_browser()
    page = await browser.newPage()
    
    try:
        # Set view size to match standard A4 page aspect ratio
        await page.setViewport({'width': 794, 'height': 1123, 'deviceScaleFactor': 2})
        
        # Set raw HTML content
        await page.setContent(html_content)
        # Nudge loop to allow chromium to parse content and render layout
        await asyncio.sleep(0.2)
        
        # Render page as PDF with A4 paper format and printBackground enabled to preserve colours/images
        pdf_bytes = await page.pdf({
            'format': 'A4',
            'printBackground': True,
            'margin': {
                'top': '0px',
                'right': '0px',
                'bottom': '0px',
                'left': '0px'
            }
        })
        return pdf_bytes
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"HTML to PDF compilation failed: {str(e)}"
        )
        
    finally:
        # Ensure the page is closed to prevent memory leaks
        await page.close()

async def close_browser():
    """Closes the browser session if it exists."""
    global _browser
    async with _lock:
        if _browser is not None:
            await _browser.close()
            _browser = None
