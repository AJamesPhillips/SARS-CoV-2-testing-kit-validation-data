from flask import Flask, make_response, request
import csv
import hashlib
import json
import os
import sys


app = Flask(__name__)
dir_path = os.path.dirname(os.path.realpath(__file__))


def populate_data():
    print("Populating data")

    calculate_common_labels()

    directories = get_directories()

    for directory in directories:
        file_names = os.listdir(dir_path + "/" + directory)

        for file_name in file_names:
            if file_name.endswith(".pdf"):
                relative_file_path = directory + "/" + file_name

                meta_data = upsert_meta_data_annotations_file(relative_file_path)

                populate_relative_file_paths(relative_file_path)
                populate_pdf_files_data(file_name=file_name, meta_data=meta_data)

    print("Populated server with data from {} PDF files".format(len(pdf_files_data)))


common_labels = dict()
def calculate_common_labels():
    with open(dir_path + "/common_labels.csv", "r") as f:
        labels_csv = csv.reader(f, delimiter=",")
        for (i, values) in enumerate(labels_csv):
            try:
                label_id = int(values[0])
            except Exception as e:
                raise Exception("Invalid label id: \"{}\" on row: {}".format(values[0], i))

            label_text = values[1]

            if label_id in common_labels:
                raise Exception("Common labels has duplicate id: {} for label text: \"{}\" and \"{}\"".format(label_id, common_labels[label_id], label_text))

            common_labels[label_id] = label_text


def get_directories():
    with open(dir_path + "/PDF_directories.txt", "r") as f:
        directories = f.read().split("\n")

        directories = [directory.strip() for directory in directories if directory.strip()]
        directories = [directory for directory in directories if os.path.isdir(dir_path + "/" + directory)]
        print("Serving PDFs from following directories: \n   * " + "\n   * ".join(directories))

    return directories


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
        force_update=True,
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

            if label_id not in common_labels:
                print("Adding label id: {id} text: {text} to common labels".format(**label))
                common_labels[label_id] = label["text"]

            elif label["text"] != common_label_text:
                msg = "label text: \"{original_label_text}\" in annotation {annotation_id} of file \"{relative_file_path}\".  Common label text: \"{common_label_text}\" for label id: {label_id}".format(
                    original_label_text=label["text"],
                    annotation_id=annotation["id"],
                    relative_file_path=meta_data["relative_file_path"],
                    common_label_text=common_label_text,
                    label_id=label_id,
                )

                if force_update:
                    label["text"] = common_label_text
                    print("Updating " + msg)
                else:
                    raise Exception("Mistmatch with " + msg)

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

    annotation = request.get_json()  # TODO validate this data

    # Racy but should be fine for single user
    annotation["id"] = len(pdf_file_data["annotations"])
    pdf_file_data["annotations"].append(annotation)

    # Racy but should be fine for single user
    with open(dir_path + "/" + relative_file_path + ".annotations", "w") as f:
        json.dump(pdf_file_data, f, indent=0)

    return json.dumps(annotation)


populate_data()
