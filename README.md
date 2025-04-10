# Jupyter to Python Exporter

A Visual Studio Code extension that exports Jupyter Notebook as Python files.

## Features

This extension provides a simple way to convert your Jupyter notebooks (`.ipynb` files) to Python scripts (`.py` files) directly from the VS Code interface:

- Adds an "Export to Python" button in the notebook toolbar
- Preserves code cells with `# %%` cell markers for VS Code's Python interactive mode
- Converts markdown cells to Python comments with `# %% [markdown]` markers
- Creates Python files in the same directory as the original notebook

## How to Use

1. Open a Jupyter notebook (`.ipynb` file) in VS Code
2. Click the "Export to Python" button in the notebook toolbar (you'll see it next to the run button)
3. The extension will create a Python file with the same name in the same directory
4. A notification will appear when the export is complete


---
---

## Release Notes

### 0.0.1

- Initial release
- Added "Export to Python" button to Jupyter notebook toolbar
- Implemented basic notebook to Python file conversion

---

## Development

### Building the Extension

To build the extension locally:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript

**Enjoy!**
