import csv
import json
import os
import re


dir_path = os.path.dirname(os.path.realpath(__file__))

FILE_DATE = "2020-08-18"
DATA_DIRECTORY = dir_path + "/../../data/FDA-EUA/"
JSON_FILE_PATH_FOR_FDA_EUA_PARSED_DATA = DATA_DIRECTORY + "parsed/{}.json".format(FILE_DATE)


def get_fda_eua_parsed_data():
    with open(JSON_FILE_PATH_FOR_FDA_EUA_PARSED_DATA, "r") as f:
        fda_eua_parsed_data = json.load(f)

    return fda_eua_parsed_data


def get_FDA_EUA_pdf_file_path_from_url(url):
    matches = re.match("https://www.fda.gov/media/(\d+)/download", url)
    file_id = matches.groups()[0]
    file_path = DATA_DIRECTORY + "PDFs/{}.pdf".format(file_id)

    return file_path


def calculate_common_labels():
    common_labels = dict()

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

    return common_labels


def get_directories():
    with open(dir_path + "/PDF_directories.txt", "r") as f:
        directories = f.read().split("\n")

        directories = [directory.strip() for directory in directories if directory.strip()]
        directories = [directory for directory in directories if os.path.isdir(dir_path + "/" + directory)]

    return directories
