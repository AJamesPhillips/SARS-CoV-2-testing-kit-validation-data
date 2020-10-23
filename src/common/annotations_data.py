import json
import os
import re


from common.paths import get_FDA_EUA_pdf_file_path_from_FDA_url, get_anot8_org_file_id_from_FDA_url

urls_to_ignore = set([
    "https://www.fda.gov/medical-devices/coronavirus-covid-19-and-medical-devices/sars-cov-2-reference-panel-comparative-data",
])
# pass it fda_eua_parsed_data or a data row to get all urls
def filter_for_urls(data):
    urls = []

    if isinstance(data, list):
        for v in data:
            urls += filter_for_urls(v)
    elif isinstance(data, str) and re.match(r'^https?://', data):
        if data not in urls_to_ignore:
            urls.append(data)

    return urls


def get_annotation_files_by_test_id(fda_eua_parsed_data):
    annotation_files_by_test_id = dict()

    for data_row in fda_eua_parsed_data:
        test_id = data_row[0]
        all_annotation_files = []

        urls = filter_for_urls(data_row)

        for url in urls:
            file_path = get_FDA_EUA_pdf_file_path_from_FDA_url(url)
            annotations_file_path = file_path + ".annotations"

            if not os.path.isfile(annotations_file_path):
                continue

            # TODO: remove
            anot8_org_file_id = get_anot8_org_file_id_from_FDA_url(url)

            with open(annotations_file_path, "r") as f:
                annotation_file_contents = json.load(f)

                # TODO: remove
                annotation_file_contents["anot8_org_file_id"] = anot8_org_file_id
                for annotation in annotation_file_contents["annotations"]:
                    if "deleted" in annotation and annotation["deleted"]:
                        continue
                    annotation["anot8_org_file_id"] = anot8_org_file_id

                all_annotation_files.append(annotation_file_contents)

        annotation_files_by_test_id[test_id] = all_annotation_files

    return annotation_files_by_test_id


def get_annotations_by_label_id (annotation_files):
    annotations_by_label_id = dict()

    for annotation_file in annotation_files:
        for annotation in annotation_file["annotations"]:
            if "deleted" in annotation and annotation["deleted"]:
                continue

            for label in annotation["labels"]:
                label_id = label["id"]

                if label_id not in annotations_by_label_id:
                    annotations_by_label_id[label_id] = []

                annotations_by_label_id[label_id].append(annotation)

    return annotations_by_label_id
