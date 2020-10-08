import json
import os
import re

from parsers import IVDiagnosticsParser, HighComplexityDiagnosticsParser

dir_path = os.path.dirname(os.path.realpath(__file__))
data_path = dir_path + "/../../data/FDA-EUA/"


def get_preprocessed_html(FILE_DATE):
    FDA_EUA_html_page_file_path = data_path + "html-page/{}.htm".format(FILE_DATE)
    with open(FDA_EUA_html_page_file_path, "r") as f:
        html = f.read()

        # simplify
        html = re.sub("</?em>", "", html)
        html = re.sub("<br />", " ", html)
        html = re.sub("\s+", " ", html)
        # normalise
        html = re.sub("<span\s*class=\"file-size\">396KB\)</span>", "396KB)", html)
        html = re.sub("394KB</td>", "394KB)</td>", html)

    return html


def parse_html(html):
    iv_diagnostics_parser = IVDiagnosticsParser()
    high_complexity_diagnostics_parser = HighComplexityDiagnosticsParser()

    iv_diagnostics_parser.feed(html)
    iv_diagnostics_data_rows = iv_diagnostics_parser.rows

    high_complexity_diagnostics_parser.feed(html)
    high_complexity_diagnostics_data_rows = high_complexity_diagnostics_parser.rows

    return {
        "iv_diagnostics_data_rows": iv_diagnostics_data_rows,
        "high_complexity_diagnostics_data_rows": high_complexity_diagnostics_data_rows,
    }


def check_test_ids_are_unique(iv_diagnostics_data_rows, high_complexity_diagnostics_data_rows):
    # skip first row as it is headers
    iv_diagnostics_data_rows = iv_diagnostics_data_rows[1:]
    high_complexity_diagnostics_data_rows = high_complexity_diagnostics_data_rows[1:]

    print("{} iv rows, {} high complexity rows parsed".format(
        len(iv_diagnostics_data_rows),
        len(high_complexity_diagnostics_data_rows),
    ))

    test_ids = set()
    duplicates = set()

    for data_row in iv_diagnostics_data_rows:
        diagnostic_name = data_row[2]

        if diagnostic_name in test_ids:
            duplicates.add(diagnostic_name)
        else:
            test_ids.add(diagnostic_name)

    for data_row in high_complexity_diagnostics_data_rows:
        laboratory_name = data_row[1]

        if laboratory_name in test_ids:
            duplicates.add(laboratory_name)
        else:
            test_ids.add(laboratory_name)

    if duplicates:
        raise Exception("Found {} duplicates: {}".format(len(duplicates), duplicates))


def merge_data(iv_diagnostics_data_rows, high_complexity_diagnostics_data_rows):
    # skip first row as it is headers
    iv_diagnostics_data_rows = iv_diagnostics_data_rows[1:]
    high_complexity_diagnostics_data_rows = high_complexity_diagnostics_data_rows[1:]

    merged_data_rows = [
        ["Date EUA First Issued", "manufacturer / laboratory name", "test name", "In Vitro / High Complexity"]
    ]

    for data_row in iv_diagnostics_data_rows:
        merged_data_rows.append([data_row[0], data_row[1], data_row[2], "In Vitro"])

    for data_row in high_complexity_diagnostics_data_rows:
        merged_data_rows.append([data_row[0], data_row[1], data_row[2], "High Complexity"])

    return merged_data_rows


def store_results(file_name, data_rows):
    json_file_path_for_parsed_data = data_path + "parsed/{}.json".format(file_name)
    with open(json_file_path_for_parsed_data, "w") as f:
        json.dump(data_rows, f, indent=4)


def main():
    FILE_DATE = "2020-08-18"

    html = get_preprocessed_html(FILE_DATE)
    results = parse_html(html)
    check_test_ids_are_unique(**results)

    merged_data = merge_data(**results)

    store_results("{}_iv".format(FILE_DATE), results["iv_diagnostics_data_rows"])
    store_results("latest_iv", results["iv_diagnostics_data_rows"])
    store_results("{}_high_complexity".format(FILE_DATE), results["high_complexity_diagnostics_data_rows"])
    store_results("latest_high_complexity", results["high_complexity_diagnostics_data_rows"])

    store_results("{}_merged".format(FILE_DATE), results["iv_diagnostics_data_rows"])
    store_results("latest_merged", merged_data)


main()
