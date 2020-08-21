from flask import Flask, make_response
import os

app = Flask(__name__)
dir_path = os.path.dirname(os.path.realpath(__file__))


FILE_DATE = "2020-08-18"


@app.route("/")
def index():
    file_path = dir_path + "/../data/FDA-EUA/html-page/{}.htm".format(FILE_DATE)
    with open(file_path, "r") as f:
        contents = f.read()

    return contents


@app.route("/media/<int:file_id>/download")
def media(file_id):
    file_path = dir_path + "/../data/FDA-EUA/PDFs/{}.pdf".format(file_id)

    if not os.path.isfile(file_path):
        return """<html>
        <body>
            <h1>404</h1>
            <p>File does not exist.  Try:
                <a href="{url}">{url}</a>
            </p>
        </body>
        </html>""".format(url="https://www.fda.gov/media/{}/download".format(file_id))

    with open(file_path, "rb") as f:
        binary_pdf = f.read()

    response = make_response(binary_pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = \
        'inline; filename=%s.pdf' % 'yourfilename'
    return response
