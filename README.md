
# Installation

    python3 -m venv venv
    . venv/bin/activate
    pip install -r requirements.txt


# Run local

    . venv/bin/activate

## Run scripts

### FDA EUAs page and related PDF files

    python3 src/FDA_EUAs_list/parse_html.py
    python3 src/FDA_EUAs_list/get_PDFs.py

### FDA reference panel html

    python3 src/FDA_reference_panel/get_latest_version.py
    python3 src/FDA_reference_panel/parse_versions.py

## Run local pages

### FDA EUA html pages

    export FLASK_APP=src/FDA_EUAs_list/serve_html.py && flask run --port=5001

### Assessment page of FDA EUAs

    export FLASK_APP=src/FDA_EUA_assessment/serve.py && flask run --port=5002

### PDF annotator

    export FLASK_APP=src/annotated_PDFs/serve.py && flask run --port=5003


# Dev

## Updating dependencies

Remember to:

    pip freeze > requirements.txt

## FDA EUA assessment page

    npm run watch

