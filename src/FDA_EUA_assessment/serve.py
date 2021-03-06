from flask import Flask, make_response
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from common import get_fda_eua_parsed_data, get_annotation_files_by_test_id, get_anot8_org_file_id_from_FDA_url

dir_path = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__)


@app.route("/")
def index():
    html_file_path = dir_path + "/index.html"
    with open(html_file_path, "r") as f:
        html_contents = f.read()

    fda_eua_parsed_data = get_fda_eua_parsed_data()
    # skip first row as it is headers
    fda_eua_parsed_data = fda_eua_parsed_data[1:]

    # TODO REMOVE (copied from merge.py)
    for fda_eua_row in fda_eua_parsed_data:
        EUAs = fda_eua_row[10]
        url_to_IFU_or_EUA = EUAs[0] if EUAs else fda_eua_row[11]
        anot8_org_file_id = get_anot8_org_file_id_from_FDA_url(url_to_IFU_or_EUA)
        fda_eua_row.append(anot8_org_file_id)
    # ^^^ REMOVE section ^^^

    annotation_files_by_test_id = get_annotation_files_by_test_id(fda_eua_parsed_data)

    src_file_path = dir_path + "/src.js"
    with open(src_file_path, "r") as f:
        src = f.read()

    html_contents = html_contents.replace("\"<FDA_EUA_PARSED_DATA>\"", json.dumps(fda_eua_parsed_data, ensure_ascii=False))
    html_contents = html_contents.replace("\"<ANNOTATION_FILES_BY_TEST_ID>\"", json.dumps(annotation_files_by_test_id, ensure_ascii=False))
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
