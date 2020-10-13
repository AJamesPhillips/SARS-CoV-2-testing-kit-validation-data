from flask import Flask, make_response, redirect
import os

app = Flask(__name__)
dir_path = os.path.dirname(os.path.realpath(__file__))


@app.route("/")
def index():
    file_path = dir_path + "/../../data/FDA-EUA/html_pages/latest.htm"
    with open(file_path, "r") as f:
        contents = f.read()

    return contents


@app.route("/media/<int:file_id>/download")
def media(file_id):
    file_path = dir_path + "/../../data/FDA-EUA/PDFs/{}.pdf".format(file_id)

    if not os.path.isfile(file_path):
        return """<html>
        <body>
            <h1>404</h1>
            <p>File does not exist.  Try:
                <a href="{url}">{url}</a>
            </p>
        </body>
        </html>""".format(url="https://www.fda.gov/media/{}/download".format(file_id))

    pdf_annotation_server_url = "http://localhost:5003"
    redirect_url = pdf_annotation_server_url + "/render_pdf?relative_file_path=../../data/FDA-EUA/PDFs/{}.pdf".format(file_id)
    return redirect(redirect_url, code=302)

    # with open(file_path, "rb") as f:
    #     binary_pdf = f.read()

    # response = make_response(binary_pdf)
    # response.headers["Content-Type"] = "application/pdf"
    # response.headers["Content-Disposition"] = "inline; filename={}.pdf".format(file_id)
    # return response
