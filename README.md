# VS Copy Clipboard Extension

A Visual Studio Code (& Cursor & Windsurf) extension that allows users to right-click on selected files or folders in the file explorer and copy their contents directly to the clipboard. 
<br> <br>
<img width="396" alt="Screenshot 2025-03-06 at 11 46 58 PM" src="https://github.com/user-attachments/assets/3b797073-9cb4-4979-8509-70e75cf44f0f" />
<img width="275" alt="Screenshot 2025-03-06 at 11 49 29 PM" src="https://github.com/user-attachments/assets/5c20976c-e3d1-4975-8d48-d285635c26c4" />

<br><br>
## Features

- **File Operations:**
  - Copy single file contents to clipboard with a right-click
  - Clear file headers with paths

- **Folder Operations:**
  - Copy entire folder contents with directory structure
  - Copy just the directory structure without file contents
  - Preserves hierarchy in an easy-to-read format
  - Automatically excludes common directories like `node_modules`, `__pycache__`, `.git`, etc.

- **Project Root Operations:**
  - Right-click on the project root area to copy the entire project structure and/or contents
  - Access the same folder commands directly from the workspace root

- **General Features:**
  - Recursively processes folders
  - Separates files with clear delimiters
  - Skips binary files automatically
  - Displays a confirmation message upon successful copy

![Usage Animation](images/usage.gif)

### From .vsix File
VSCode and Windsurf:
1. Download the `.vsix` file from the [GitHub releases page](https://github.com/cytokineking/vs-copy-clipboard-extension/releases)
2. Open VS Code/Windsurf
3. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
4. Click on the "..." menu (top-right of the Extensions view)
5. Select "Install from VSIX..."
6. Navigate to and select the downloaded `.vsix` file
7. Restart VS Code/Windsurf if prompted

Cursor:
1. Download the `.vsix` file from the [GitHub releases page](https://github.com/cytokineking/vs-copy-clipboard-extension/releases)
2. Open Cursor
3. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
4. Drag and drop the downloaded `.vsix` file into the extensions explorer
5. Restart Cursor if prompted

## Usage

### For Files:
1. Right-click on a file in the Explorer view
2. Select "Copy File to Clipboard"
3. The file contents will be copied to your clipboard with proper formatting

### For Folders:
1. Right-click on a folder in the Explorer view
2. Choose one of two options:
   - "Copy Folder Contents and Structure to Clipboard" - copies both directory structure and all file contents
   - "Copy Directory Structure Only to Clipboard" - copies just the directory tree without file contents
3. Paste anywhere you need the contents

### For Project Root:
1. Right-click in the empty area of the Explorer view (not on any specific file or folder)
2. Choose one of two options:
   - "Copy Folder Contents and Structure to Clipboard" - copies the entire project's structure and contents
   - "Copy Directory Structure Only to Clipboard" - copies just the project's directory tree
3. Paste anywhere you need the contents

## Format

The copied text will be formatted as follows:

### For Files:
- Files will have a header with the file path: `# FILE: /path/to/file.js`
- File contents follow the header

### For Folders with Contents:
- First displays a tree-like directory structure
- Followed by the actual file contents
- Files have a header with the file path: `# FILE: /path/to/file.js`
- Directories have a header: `# DIRECTORY: folder-name`
- Files are separated by `========` delimiters
- Files within directories are separated by `--------` delimiters
- Binary files are noted but their contents are not copied

### For Directory Structure Only:
- Displays a tree-like representation of the folder structure
- Uses ASCII characters to show the hierarchy

## Excluded Directories

The extension automatically excludes certain directories and files that are typically not needed when sharing code with an LLM, including:

- `node_modules`, `__pycache__`, `.git`
- `venv`, `.venv`, `.env`, `env`
- Build directories: `build`, `dist`, `out`, `target`, etc.
- Cache directories: `.cache`, `.parcel-cache`, `.pytest_cache`, etc.
- IDE folders: `.vscode`, `.idea`, `.vs`
- System files: `.DS_Store`, `Thumbs.db`
- And many more

## Extension Settings

This extension doesn't add any VS Code settings.

## Known Issues

- Very large files or directories might cause performance issues
- Some encoding issues might occur with non-UTF8 text files

## Release Notes

### 1.1.0

- Added ability to access folder commands by right-clicking directly on the project root in the Explorer view
- Improved handling of workspace root folders

### 1.0.0

- Initial release
- Basic file and folder copying functionality
- Binary file detection
- Separate commands for files and folders
- Option to copy only directory structure
- Smart filtering of common directories like node_modules, __pycache__, etc.
- Directory structure visualization

## Development

### Building the Extension

```bash
# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension into a .vsix file
npx vsce package
```

### Installing the Development Version

After packaging the extension, you can install it directly from the .vsix file:

```bash
code --install-extension vs-copy-clipboard-extension-1.0.0.vsix
```

### Testing the Extension

1. Open this directory in VS Code
2. Press F5 to launch a new window with the extension loaded
3. Right-click on files/folders in the explorer to test the functionality

## License

[MIT](LICENSE)
