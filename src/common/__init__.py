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


# pass it fda_eua_parsed_data or a data row to get all urls
def filter_for_urls(data):
    urls = []

    if isinstance(data, list):
        for v in data:
            urls += filter_for_urls(v)
    elif isinstance(data, str) and re.match(r'^https?://', data):
        urls.append(data)

    return urls


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


def get_annotations_by_test_name(fda_eua_parsed_data):

    # skip first row as it is headers
    data_rows = fda_eua_parsed_data[1:]

    annotations_by_test_name = dict()

    for data_row in data_rows:
        test_name = data_row[2]
        all_annotations = []

        urls = filter_for_urls(data_row)

        for url in urls:
            file_path = get_FDA_EUA_pdf_file_path_from_url(url)
            annotations_file_path = file_path + ".annotations"

            if not os.path.isfile(annotations_file_path):
                continue

            with open(annotations_file_path, "r") as f:
                annotations = json.load(f)
                all_annotations.append(annotations)

        annotations_by_test_name[test_name] = all_annotations

    return annotations_by_test_name
