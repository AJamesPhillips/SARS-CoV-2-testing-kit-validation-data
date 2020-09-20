# Annotated PDFs server

* Serves PDFs and annotations meta data
* Allows creation of new annotations
* Renders:
* * PDFs
* * their annotations
* * highlighted annotations

e.g. http://localhost:5003/render_pdf?relative_file_path=../../data/FDA-EUA/PDFs/134919.pdf&highlighted_annotation_ids=1,2

See top level README for instructions to run server

## Specifying sources (directories) of PDFs

Edit the `PDF_directories.txt` file.

## Specifying labels

Edit the `common_labels.csv` file.
