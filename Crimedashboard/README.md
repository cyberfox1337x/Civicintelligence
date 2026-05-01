# Universal Auto Typer

This project is a Chrome extension that types user-provided code or text into the last editor field you selected on a website.

## What it does

- Works on most regular websites
- Supports `input`, `textarea`, and many `contenteditable` editors
- Adds special targeting for common code editors such as Codio-style Monaco editors, Ace, and CodeMirror
- Searches across tab frames so editors embedded inside iframes are more likely to work
- Adds a best-effort fallback for remote or canvas-based coding sessions inside the browser
- Includes preset human typing profiles so you can start with realistic speeds instead of tuning everything manually
- Lets you control minimum delay, maximum delay, and start delay
- Lets you control break frequency plus minimum and maximum break duration
- Can clear the field before typing
- Remembers your last popup settings

## How to install

1. Open Chrome and go to `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `c:\Users\Security Admin\Desktop\Auto typer codio`

## How to use

1. Open any regular website or coding platform with an editor
2. Click inside the field, code editor, or remote coding surface you want to target
3. Open the extension popup
4. Paste or write the text you want typed
5. Adjust delays if needed
6. Click **Start Typing**

If you want the extension to replace the existing field content, enable **Clear the target field before typing** first.

For remote IDE surfaces such as streamed desktop editors in Codio, simulated keyboard events are best-effort only because the browser may not treat extension-generated key events as trusted native input.

## Limits

- Chrome blocks extensions on some pages such as `chrome://` pages, the Chrome Web Store, and some built-in PDF views
- Some heavily customized editors or sandboxed frames may still reject simulated typing
- Use this responsibly and in ways that respect site rules and local laws
