import json

from common.paths import (
    DATA_FILE_PATH_EUAs_LATEST_PARSED_DATA,
    DATA_DIRECTORY_EUAs
)


def get_fda_eua_parsed_data():
    with open(DATA_FILE_PATH_EUAs_LATEST_PARSED_DATA, "r") as f:
        fda_eua_merged_parsed_data = json.load(f)

    return fda_eua_merged_parsed_data


def deprecated_get_fda_eua_parsed_data(merged):
    JSON_FILE_PATH_FOR_FDA_EUA_merged_PARSED_DATA = DATA_DIRECTORY_EUAs + "parsed/latest_merged.json"
    JSON_FILE_PATH_FOR_FDA_EUA_iv_PARSED_DATA = DATA_DIRECTORY_EUAs + "parsed/latest_iv.json"
    JSON_FILE_PATH_FOR_FDA_EUA_high_complexity_PARSED_DATA = DATA_DIRECTORY_EUAs + "parsed/latest_high_complexity.json"

    if merged:
        with open(JSON_FILE_PATH_FOR_FDA_EUA_merged_PARSED_DATA, "r") as f:
            fda_eua_merged_parsed_data = json.load(f)

        return fda_eua_merged_parsed_data

    else:
        with open(JSON_FILE_PATH_FOR_FDA_EUA_iv_PARSED_DATA, "r") as f:
            fda_eua_iv_parsed_data = json.load(f)

        with open(JSON_FILE_PATH_FOR_FDA_EUA_high_complexity_PARSED_DATA, "r") as f:
            fda_eua_high_complexity_parsed_data = json.load(f)

        return {
            "fda_eua_iv_parsed_data": fda_eua_iv_parsed_data,
            "fda_eua_high_complexity_parsed_data": fda_eua_high_complexity_parsed_data,
        }

