from flask import Flask, make_response, request
import hashlib
import json
import os
import sys


app = Flask(__name__)
dir_path = os.path.dirname(os.path.realpath(__file__))


with open(dir_path + "/PDF_directories.txt", "r") as f:
    directories = f.read().split("\n")

    directories = [directory.strip() for directory in directories if directory.strip()]
    directories = [directory for directory in directories if os.path.isdir(dir_path + "/" + directory)]
    print("Serving PDFs from following directories: \n   * " + "\n   * ".join(directories))


# Adapted from: https://stackoverflow.com/a/22058673/539490
def sha1_hash_file(file_descriptor):
    # BUF_SIZE is totally arbitrary, change for your app!
    BUF_SIZE = 65536  # lets read stuff in 64kb chunks!

    sha1 = hashlib.sha1()

    while True:
        data = file_descriptor.read(BUF_SIZE)
        if not data:
            break
        sha1.update(data)

    return sha1.hexdigest()


def upsert_meta_data_annotations_file(relative_file_path):
    meta_file_path = dir_path + "/" + relative_file_path + ".annotations"

    if not os.path.isfile(meta_file_path):
        with open(dir_path + "/" + relative_file_path, "rb") as f:
            file_sha1_hash = sha1_hash_file(f)

        meta_data = {
            "relative_file_path": relative_file_path,
            "file_sha1_hash": file_sha1_hash,
            "annotations": [],
        }

        with open(meta_file_path, "w") as f:
            json.dump(meta_data, f, indent=0)

    with open(meta_file_path, "r") as f:
        return json.load(f)


pdf_files_data = []
relative_file_paths = set()

def populate_pdf_files_data():
    print("Populating PDF files data")

    for directory in directories:
        file_names = os.listdir(dir_path + "/" + directory)

        for file_name in file_names:
            if file_name.endswith(".pdf"):
                relative_file_path = directory + "/" + file_name
                relative_file_paths.add(relative_file_path)

                meta_data = upsert_meta_data_annotations_file(relative_file_path)
                pdf_file_data = {
                    "file_name": file_name,
                    **meta_data,
                }
                pdf_files_data.append(pdf_file_data)

    print("Populated server with {} PDF files".format(len(pdf_files_data)))


@app.route("/")
def index():

    pdf_file_path_html_links = ""

    for pdf_file_data in pdf_files_data:
        # pdf_file_path_html_links += "<a href=\"/render_pdf?file_sha1_hash={file_sha1_hash}\">{file_name}</a><br/>\n".format(**pdf_file_data)

        pdf_file_path_html_links += "<a href=\"/render_pdf?relative_file_path={relative_file_path}\">{file_name}</a><br/>\n".format(**pdf_file_data)

    return pdf_file_path_html_links


@app.route("/render_pdf")
def render_pdf():
    relative_file_path = request.args.get("relative_file_path")
    if relative_file_path not in relative_file_paths:
        return "relative_file_path not found for " + relative_file_path

    with open(dir_path + "/" + relative_file_path + ".annotations", "r") as f:
        pdf_file_data_json = f.read()

    with open(dir_path + "/render_pdf.html", "r") as f:
        html = f.read()

    with open(dir_path + "/lib/pdfjs.js", "r") as f:
        pdfjs_file = f.read()

    with open(dir_path + "/lib/pdfjs.worker.js", "r") as f:
        pdfjs_worker_file = f.read()

    html = (html
        .replace("\"<PDFJS>\"", pdfjs_file)
        .replace("\"<PDFJS_WORKER>\"", pdfjs_worker_file)
        .replace("\"<PDF_FILE_DATA_JSON>\"", pdf_file_data_json))

    return html


@app.route("/serve_pdf")
def serve_pdf():
    relative_file_path = request.args.get("relative_file_path")
    if relative_file_path not in relative_file_paths:
        return "relative_file_path not found for " + relative_file_path

    with open(dir_path + "/" + relative_file_path, "rb") as f:
        binary_pdf = f.read()

    response = make_response(binary_pdf)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = "inline; filename={}.pdf".format(relative_file_path)
    return response


@app.route("/annotation", methods = ["POST"])
def annotation():
    relative_file_path = request.args.get("relative_file_path")
    if relative_file_path not in relative_file_paths:
        return "relative_file_path not found for " + relative_file_path

    with open(dir_path + "/" + relative_file_path + ".annotations", "r") as f:
        pdf_file_data = json.load(f)

    annotation = request.get_json()  # TODO validate this data

    # Might be racy but should be fine for single user
    annotation["id"] = len(pdf_file_data["annotations"])
    pdf_file_data["annotations"].append(annotation)

    with open(dir_path + "/" + relative_file_path + ".annotations", "w") as f:
        json.dump(pdf_file_data, f, indent=0)

    return json.dumps(annotation)


populate_pdf_files_data()
