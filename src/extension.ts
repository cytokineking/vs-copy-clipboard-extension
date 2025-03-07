import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  // Command for copying folder contents with directory structure
  const copyFolderCommand = vscode.commands.registerCommand('vs-copy-contents-to-clipboard.copyFolderContents', async (uri?: vscode.Uri) => {
    // If no URI is provided, we might be clicking on the workspace root
    if (!uri) {
      // Get the workspace folder
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        uri = workspaceFolders[0].uri;
      } else {
        vscode.window.showErrorMessage('No folder selected and no workspace folder available.');
        return;
      }
    }

    try {
      const stats = await fs.promises.stat(uri.fsPath);
      if (!stats.isDirectory()) {
        vscode.window.showErrorMessage('Selected item is not a folder.');
        return;
      }

      // Generate tree diagram of directory structure
      const treeStructure = await generateTreeStructure([uri]);
      
      // Process the selected folder
      const clipboardText = await processSelectedItems([uri]);
      
      // Combine tree structure and file contents
      const finalOutput = `${treeStructure}\n\n${'='.repeat(80)}\n\n${clipboardText}`;
      
      // Copy to clipboard
      await vscode.env.clipboard.writeText(finalOutput);
      
      // Show success message
      vscode.window.showInformationMessage('Folder contents copied to clipboard successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Error copying contents to clipboard: ${errorMessage}`);
    }
  });

  // Command for copying a single file
  const copyFileCommand = vscode.commands.registerCommand('vs-copy-contents-to-clipboard.copyFileContents', async (uri?: vscode.Uri) => {
    if (!uri) {
      vscode.window.showErrorMessage('No file selected.');
      return;
    }

    try {
      const stats = await fs.promises.stat(uri.fsPath);
      if (stats.isDirectory()) {
        vscode.window.showErrorMessage('Selected item is a folder. Use "Copy folder contents" instead.');
        return;
      }

      // Process the selected file
      const fileContent = await processFile(uri.fsPath);
      
      // Copy to clipboard
      await vscode.env.clipboard.writeText(fileContent);
      
      // Show success message
      vscode.window.showInformationMessage('File contents copied to clipboard successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Error copying contents to clipboard: ${errorMessage}`);
    }
  });

  // New command for copying only directory structure
  const copyStructureCommand = vscode.commands.registerCommand('vs-copy-contents-to-clipboard.copyDirectoryStructure', async (uri?: vscode.Uri) => {
    // If no URI is provided, we might be clicking on the workspace root
    if (!uri) {
      // Get the workspace folder
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        uri = workspaceFolders[0].uri;
      } else {
        vscode.window.showErrorMessage('No folder selected and no workspace folder available.');
        return;
      }
    }

    try {
      const stats = await fs.promises.stat(uri.fsPath);
      if (!stats.isDirectory()) {
        vscode.window.showErrorMessage('Selected item is not a folder.');
        return;
      }

      // Generate tree diagram of directory structure only
      const treeStructure = await generateTreeStructure([uri]);
      
      // Copy to clipboard
      await vscode.env.clipboard.writeText(treeStructure);
      
      // Show success message
      vscode.window.showInformationMessage('Directory structure copied to clipboard successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Error copying directory structure to clipboard: ${errorMessage}`);
    }
  });

  context.subscriptions.push(copyFolderCommand, copyFileCommand, copyStructureCommand);
}

async function processSelectedItems(items: vscode.Uri[]): Promise<string> {
  const fileContents: string[] = [];
  
  for (const item of items) {
    const stats = await fs.promises.stat(item.fsPath);
    
    if (stats.isDirectory()) {
      // Process directory
      const folderContent = await processDirectory(item.fsPath, path.basename(item.fsPath));
      fileContents.push(folderContent);
    } else {
      // Process file
      const fileContent = await processFile(item.fsPath);
      fileContents.push(fileContent);
    }
  }
  
  return fileContents.join('\n\n' + '='.repeat(80) + '\n\n');
}

async function processDirectory(dirPath: string, relativePath: string): Promise<string> {
  const result: string[] = [];
  result.push(`# DIRECTORY: ${relativePath}`);
  
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);
    
    // Skip excluded directories and files
    if (shouldExclude(entryPath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      // Recursively process subdirectory
      const subdirContent = await processDirectory(entryPath, entryRelativePath);
      result.push(subdirContent);
    } else {
      // Process file in directory
      const fileContent = await processFile(entryPath);
      result.push(fileContent);
    }
  }
  
  return result.join('\n\n' + '-'.repeat(40) + '\n\n');
}

async function processFile(filePath: string): Promise<string> {
  try {
    // Skip binary files
    if (isBinaryFile(filePath)) {
      return `# FILE: ${filePath}\n[Binary file content not copied]`;
    }
    
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return `# FILE: ${filePath}\n\n${content}`;
  } catch (error) {
    return `# FILE: ${filePath}\n\n[Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

function isBinaryFile(filePath: string): boolean {
  // List of common binary file extensions
  const binaryExtensions = [
    '.exe', '.dll', '.obj', '.bin', '.dat', '.png', '.jpg', '.jpeg', 
    '.gif', '.bmp', '.ico', '.pdf', '.doc', '.docx', '.ppt', '.pptx', 
    '.xls', '.xlsx', '.zip', '.rar', '.7z', '.tar', '.gz', '.mp3', 
    '.mp4', '.avi', '.mov', '.wav', '.flac', '.o', '.so', '.dylib'
  ];
  
  const ext = path.extname(filePath).toLowerCase();
  return binaryExtensions.includes(ext);
}

// New function to generate tree structure
async function generateTreeStructure(items: vscode.Uri[]): Promise<string> {
  const result: string[] = ['# Directory Structure:'];
  
  for (const item of items) {
    const stats = await fs.promises.stat(item.fsPath);
    
    if (stats.isDirectory()) {
      // Process directory structure
      const dirTree = await buildDirectoryTree(item.fsPath, 0, path.basename(item.fsPath));
      result.push(dirTree);
    } else {
      // Just add the file
      result.push(`├── ${path.basename(item.fsPath)}`);
    }
  }
  
  return result.join('\n');
}

async function buildDirectoryTree(dirPath: string, level: number, name: string): Promise<string> {
  const indent = '│   '.repeat(level);
  const result: string[] = [`${indent}├── ${name}/`];
  
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const sortedEntries = entries.sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      // Alphabetical within the same type
      return a.name.localeCompare(b.name);
    });
    
    for (const entry of sortedEntries) {
      const entryPath = path.join(dirPath, entry.name);
      
      // Skip excluded directories and files
      if (shouldExclude(entryPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        const subTree = await buildDirectoryTree(entryPath, level + 1, entry.name);
        result.push(subTree);
      } else {
        result.push(`${indent}│   ├── ${entry.name}`);
      }
    }
  } catch (error) {
    result.push(`${indent}│   ├── [Error reading directory: ${error instanceof Error ? error.message : 'Unknown error'}]`);
  }
  
  return result.join('\n');
}

// Filtering function to exclude common directories/files
function shouldExclude(path: string): boolean {
  // List of directories and files to exclude
  const excludePatterns = [
    'node_modules',
    '__pycache__',
    '.git',
    '.venv',
    'venv',
    'env',
    '.env',
    '.vs',
    '.vscode',
    '.idea',
    'build',
    'dist',
    'coverage',
    '.next',
    '.svelte-kit',
    '.cache',
    '.parcel-cache',
    '.yarn',
    'bin',
    'obj',
    '.DS_Store',
    'Thumbs.db',
    '.pytest_cache',
    '.mypy_cache',
    '.ruff_cache',
    '.gradle',
    '.nuxt',
    'out', // Build output directory
    'target', // Rust/Maven build output
    'vendor', // Dependency directory in some languages
    '.terraform',
    'debug',
    'logs',
    'tmp',
    'temp'
  ];

  // Check if the path contains any of the excluded patterns
  return excludePatterns.some(pattern => 
    path.includes(`/${pattern}/`) || path.includes(`\\${pattern}\\`) || 
    path.endsWith(`/${pattern}`) || path.endsWith(`\\${pattern}`)
  );
}

export function deactivate() {}