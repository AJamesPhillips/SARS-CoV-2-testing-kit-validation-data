import csv
import os
import sys

from common.get_test_id import get_test_id
from common.FDA_EUAs_parsed_data import (
    get_fda_eua_parsed_data,
    deprecated_get_fda_eua_parsed_data,
)
from common.annotations_data import (
    filter_for_urls,
    get_FDA_EUA_pdf_file_path_from_url,
    get_annotation_files_by_test_id,
    get_annotations_by_label_id,
)
from common.FDA_reference_panel_lod_data import (
    get_fda_reference_panel_lod_data_by_test_id,
)
from common.paths import (
    dir_path,
    DATA_DIRECTORY_EUAs,
    DATA_FILE_PATH_EUAs_LATEST_PARSED_DATA,
    DATA_FILE_PATH_merged_data,
)


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
