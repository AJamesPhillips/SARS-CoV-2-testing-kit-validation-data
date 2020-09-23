from flask import Flask, make_response, request
import hashlib
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from common import calculate_common_labels, get_directories


dir_path = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__)

common_labels = dict()
def populate_data():
    print("Populating data")

    global common_labels
    common_labels = calculate_common_labels()

    directories = get_directories()
    print("Serving PDFs from following directories: \n   * " + "\n   * ".join(directories))

    for directory in directories:
        file_names = os.listdir(dir_path + "/" + directory)

        for file_name in file_names:
            if file_name.endswith(".pdf"):
                relative_file_path = directory + "/" + file_name

                meta_data = upsert_meta_data_annotations_file(relative_file_path)

                populate_relative_file_paths(relative_file_path)
                populate_pdf_files_data(file_name=file_name, meta_data=meta_data)

    print("Populated server with data from {} PDF files".format(len(pdf_files_data)))


def upsert_meta_data_annotations_file(relative_file_path):
    meta_file_path = dir_path + "/" + relative_file_path + ".annotations"

    current_version = 2

    if os.path.isfile(meta_file_path):
        with open(meta_file_path, "r") as f:
            meta_data = json.load(f)
    else:
        with open(dir_path + "/" + relative_file_path, "rb") as f:
            file_sha1_hash = sha1_hash_file(f)

        meta_data = {
            "version": current_version,
            "relative_file_path": relative_file_path,
            "file_sha1_hash": file_sha1_hash,
            "annotations": [],
        }

    if meta_data["version"] != current_version:
        meta_data = upgrade_meta_data(meta_data)

    meta_data = ensure_consistent_labels(
        meta_data=meta_data,
        force_update=False,
    )

    with open(meta_file_path, "w") as f:
        json.dump(meta_data, f, indent=0)

    return meta_data


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


def upgrade_meta_data(meta_data):
    if meta_data["version"] == 1:
        meta_data["version"] = 2
        meta_data["comments"] = []
    return meta_data


def ensure_consistent_labels(meta_data, force_update):
    for annotation in meta_data["annotations"]:
        for label in annotation["labels"]:

            label_id = label["id"]
            common_label_text = common_labels.get(label_id, None)

            msg = "label id: {label_id} text: \"{original_label_text}\" in annotation {annotation_id} of file \"{relative_file_path}\"".format(
                label_id=label_id,
                original_label_text=label["text"],
                annotation_id=annotation["id"],
                relative_file_path=meta_data["relative_file_path"],
            )

            if label_id not in common_labels:
                if force_update:
                    raise Exception("TODO: Add {msg} to common labels".format(msg=msg))
                    # TODO
                    # common_labels[label_id] = label["text"]
                    # Save to file
                else:
                    raise Exception("{msg} not in common labels.csv".format(msg=msg))

            elif label["text"] != common_label_text:
                if force_update:
                    label["text"] = common_label_text
                    print("Updating text of {msg} to common label text: \"{common_label_text}\"".format(
                        msg=msg,
                        common_label_text=common_label_text,
                    ))
                else:
                    raise Exception("Mismatch with common label text of \"{common_label_text}\" with {msg}".format(
                        common_label_text=common_label_text,
                        msg=msg,
                    ))

    return meta_data


relative_file_paths = set()
def populate_relative_file_paths(relative_file_path):
    relative_file_paths.add(relative_file_path)


pdf_files_data = []
def populate_pdf_files_data(file_name, meta_data):
    pdf_file_data = {
        "file_name": file_name,
        **meta_data,
    }
    pdf_files_data.append(pdf_file_data)


@app.route("/")
def index():

    pdf_file_path_html_links = ""

    for pdf_file_data in pdf_files_data:
        # pdf_file_path_html_links += "<a href=\"/render_pdf?file_sha1_hash={file_sha1_hash}\">{file_name}</a><br/>\n".format(**pdf_file_data)

        pdf_file_path_html_links += "<a href=\"/render_pdf?relative_file_path={relative_file_path}\">{file_name}</a><br/>\n".format(**pdf_file_data)

    return pdf_file_path_html_links


@app.route("/render_pdf")
def render_pdf():
    global common_labels
    common_labels = calculate_common_labels()

    relative_file_path = request.args.get("relative_file_path")
    if relative_file_path not in relative_file_paths:
        return "relative_file_path not found for " + relative_file_path

    with open(dir_path + "/render_pdf.html", "r") as f:
        html = f.read()

    with open(dir_path + "/lib/pdfjs.js", "r") as f:
        pdfjs_file = f.read()

    with open(dir_path + "/lib/pdfjs.worker.js", "r") as f:
        pdfjs_worker_file = f.read()

    with open(dir_path + "/" + relative_file_path + ".annotations", "r") as f:
        pdf_file_data_json = f.read()

    common_labels_json = json.dumps(common_labels)

    html = (html
        .replace("\"<PDFJS>\"", pdfjs_file)
        .replace("\"<PDFJS_WORKER>\"", pdfjs_worker_file)
        .replace("\"<PDF_FILE_DATA_JSON>\"", pdf_file_data_json)
        .replace("\"<COMMON_LABELS_DATA_JSON>\"", common_labels_json)
    )

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

    annotations = request.get_json()  # TODO validate this data

    # Racy but should be fine for single user
    for (i, annotation) in enumerate(annotations):
        annotation["id"] = i
        if "dirty" in annotation:
            del annotation["dirty"]
    pdf_file_data["annotations"] = annotations

    # Racy but should be fine for single user
    with open(dir_path + "/" + relative_file_path + ".annotations", "w") as f:
        json.dump(pdf_file_data, f, indent=0)

    return json.dumps(annotation)


populate_data()
