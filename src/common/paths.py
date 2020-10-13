import os


dir_path = os.path.dirname(os.path.realpath(__file__))


DATA_DIRECTORY_EUAs = dir_path + "/../../data/FDA-EUA/"
DATA_FILE_PATH_EUAs_LATEST_PARSED_DATA = DATA_DIRECTORY_EUAs + "parsed/latest.json"


DATA_DIRECTORY_FDA_reference_panel = dir_path + "/../../data/FDA_reference_panel/"
DATA_FILE_PATH_FDA_reference_panel_LATEST_PARSED_DATA = DATA_DIRECTORY_FDA_reference_panel + "parsed/latest.json"


DATA_DIRECTORY_merged_data = dir_path + "/../../data/merged_data/"
DATA_FILE_PATH_merged_data = DATA_DIRECTORY_merged_data + "latest.json"
