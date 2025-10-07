# Trajectories

## Introduction
This repository is a simple React-based website that generates the visualizations used in Samuel Dal Zilio’s PhD thesis. It reads TSV datasets from `/public/data/trajectories.tsv` and dynamically renders them in the browser using React Router v7.
A thin layer of D3.js is used to manage time and space scales and to position the data points accordingly.
The final maps were exported as PDFs directly from the web pages (“Print as PDF”), using a dedicated print stylesheet for cleaner layouts.

## How to Add Data Points
To add new data points:
1. Open the `/public/data/trajectories.tsv` file in a text editor or a spreadsheet program that supports TSV.
2. Add a new row, following the structure of the existing columns (e.g., ID, name, date, place, etc.).
3. Save the file.
Your changes will be automatically reflected the next time the site is loaded.

## Structure of `/public/data`

- `trajectories.tsv`: The main dataset containing the trajectories to visualize.
- `places.csv`: List of places used in the visualizations.
- `settings.csv`: Parameters and metadata for map configuration.
- `legends.tsv`: Definitions for the legends used in the visualizations.

## Using This with Other Trajectories or Projects

To adapt this site for other trajectory datasets:
1. Replace or add your own TSV/CSV files in the `/public/data` folder.
2. Make sure your files follow the structure expected by the React components (see the format of `trajectories.tsv`).
3. If needed, modify the components in `src/components/` to customize the display or logic.
4. The visualizations will automatically adjust to new datasets, making it easy to reuse for other projects or corpora.

Partially generated with chatgpt
https://chatgpt.com/share/67a3765c-87e8-8013-afd7-ce87aad0a411

---

## License

This project is licensed under the GNU Affero General Public License (AGPL). See the LICENSE file for details.
