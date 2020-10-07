from flask import Flask, make_response
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from common import calculate_common_labels, get_fda_eua_parsed_data, get_annotation_files_by_test_id

dir_path = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__)


@app.route("/")
def index():
    html_file_path = dir_path + "/index.html"
    with open(html_file_path, "r") as f:
        html_contents = f.read()

    labels = calculate_common_labels()
    fda_eua_parsed_data = get_fda_eua_parsed_data()
    annotation_files_by_test_id = get_annotation_files_by_test_id(fda_eua_parsed_data)

    src_file_path = dir_path + "/src.js"
    with open(src_file_path, "r") as f:
        src = f.read()

    html_contents = html_contents.replace("\"<LABEL_IDS_TO_NAMES>\"", json.dumps(labels))
    html_contents = html_contents.replace("\"<FDA_EUA_PARSED_DATA>\"", json.dumps(fda_eua_parsed_data))
    html_contents = html_contents.replace("\"<ANNOTATION_FILES_BY_TEST_ID>\"", json.dumps(annotation_files_by_test_id))
    html_contents = html_contents.replace("\"<SRC>\"", src)

    return html_contents


# @app.route("/media/<int:file_id>/download")
# def media(file_id):
#     file_path = "../data/FDA-EUA/PDFs/{}.pdf".format(file_id)

#     if not os.path.isfile(file_path):
#         return """<html>
#         <body>
#             <h1>404</h1>
#             <p>File does not exist.  Try:
#                 <a href="{url}">{url}</a>
#             </p>
#         </body>
#         </html>""".format(url="https://www.fda.gov/media/{}/download".format(file_id))

#     with open(file_path, "rb") as f:
#         binary_pdf = f.read()

#     response = make_response(binary_pdf)
#     response.headers['Content-Type'] = 'application/pdf'
#     response.headers['Content-Disposition'] = \
#         'inline; filename=%s.pdf' % 'yourfilename'
#     return response
