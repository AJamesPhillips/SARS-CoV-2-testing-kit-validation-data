import json

from common.paths import DATA_FILE_PATH_FDA_reference_panel_LATEST_PARSED_DATA



def get_fda_reference_panel_lod_parsed_data ():
    with open(DATA_FILE_PATH_FDA_reference_panel_LATEST_PARSED_DATA, "r") as f:
        fda_eua_merged_parsed_data = json.load(f)

    return fda_eua_merged_parsed_data


def get_fda_reference_panel_lod_data_by_test_id ():
    fda_reference_panel_lod_data = get_fda_reference_panel_lod_parsed_data()

    # drop first row of headers
    fda_reference_panel_lod_data = fda_reference_panel_lod_data[1:]

    reference_panel_lod_data_by_test_id = dict()

    for data_row in fda_reference_panel_lod_data:
        test_id = data_row[0]

        if test_id in reference_panel_lod_data_by_test_id:
            raise Exception("Duplicate test_id \"{}\" whilst preparing fda_reference_panel_lod_data_by_test_id".format(test_id))

        reference_panel_lod_data_by_test_id[test_id] = {
            "test_id": data_row[0],
            "developer_name": data_row[1],
            "test_name": data_row[2],
            "results_status": data_row[3],
            "lod": data_row[4],
            "sample_media_type": data_row[5],
        }

    return reference_panel_lod_data_by_test_id
