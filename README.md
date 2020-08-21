
# Installation

    python3 -m venv venv
    . venv/bin/activate
    pip install -r requirements.txt


# Run local pages

    . venv/bin/activate

## FDA EUA html pages

    export FLASK_APP=src/serve_FDA_EUA_html.py && flask run

## FDA EUA assessment page

    export FLASK_APP=src/FDA_EUA_assessment/serve.py && flask run


# Dev

## Updating dependencies

Remember to:

    pip freeze > requirements.txt

## FDA EUA assessment page

    npm run watch

