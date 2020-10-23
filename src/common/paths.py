import json
import os
import re


dir_path = os.path.dirname(os.path.realpath(__file__))
DATA_DIR_PATH = dir_path + "/../../data/"


ANOT8_ORG_CONFIG_DIR = DATA_DIR_PATH + "anot8_org_config/"


DATA_DIRECTORY_EUAs = DATA_DIR_PATH + "FDA-EUA/"
DATA_FILE_PATH_EUAs_LATEST_PARSED_DATA = DATA_DIRECTORY_EUAs + "parsed/latest.json"


DATA_DIRECTORY_FDA_reference_panel = DATA_DIR_PATH + "FDA_reference_panel/"
DATA_FILE_PATH_FDA_reference_panel_LATEST_PARSED_DATA = DATA_DIRECTORY_FDA_reference_panel + "parsed/latest.json"


DATA_DIRECTORY_merged_data = DATA_DIR_PATH + "merged_data/"
DATA_FILE_PATH_merged_data = DATA_DIRECTORY_merged_data + "latest.json"


ANOT8_ORG_NAMING_AUTHORITY_ID = "1772"
ANOT8_ORG_VAULT_ID = "2"


def get_FDA_EUA_pdf_file_name_from_FDA_url (FDA_url):
    matches = re.match("https://www.fda.gov/media/(\d+)/download", FDA_url)
    try:
        file_id = matches.groups()[0]
    except Exception as e:
        print("failed on url: ", FDA_url)
        raise e

    return file_id


def get_FDA_EUA_pdf_file_path_from_FDA_url (FDA_url):
    file_id = get_FDA_EUA_pdf_file_name_from_FDA_url(FDA_url)
    file_path = DATA_DIRECTORY_EUAs + "PDFs/{}.pdf".format(file_id)

    return file_path


def get_anot8_org_file_id_from_FDA_url (FDA_url):
    file_id = get_FDA_EUA_pdf_file_name_from_FDA_url(FDA_url)
    file_path = "FDA-EUA/PDFs/{}.pdf".format(file_id)
    anot8_org_file_id = get_anot8_org_id_for_file_path(file_path)
    return anot8_org_file_id


file_path_to_anot8_org_id_map = None
anot8_config = None
def get_map_of_file_path_to_anot8_org_id ():
    global file_path_to_anot8_org_id_map
    global anot8_config

    with open(ANOT8_ORG_CONFIG_DIR + ANOT8_ORG_VAULT_ID + ".json", "r") as f:
        new_anot8_config = json.load(f)

    if anot8_config != new_anot8_config:
        file_path_to_anot8_org_id_map = dict()
        anot8_config = new_anot8_config

        for (anot8_org_file_id, file_path) in anot8_config["id_to_relative_file_name"].items():
            if file_path in file_path_to_anot8_org_id_map:
                raise Exception("Duplicate file_path: {}".format(file_path))

            file_path_to_anot8_org_id_map[file_path] = anot8_org_file_id

    return file_path_to_anot8_org_id_map


def get_anot8_org_id_for_file_path (file_path):
    file_to_id_map = get_map_of_file_path_to_anot8_org_id()

    if file_path not in file_to_id_map:
        raise Exception("file_path not found in anot8 file_to_id_map: {}".format(file_path))

    return file_to_id_map[file_path]


# def get_anot8_org_permalink (file_path):
#     anot8_org_id = get_anot8_org_id_for_file_path(file_path)

#     return "https://anot8.org/{}.{}/{}".format(
#         ANOT8_ORG_NAMING_AUTHORITY_ID,
#         ANOT8_ORG_VAULT_ID,
#         anot8_org_id
#     )
