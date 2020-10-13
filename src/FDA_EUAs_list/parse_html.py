import json
import os
import re

from parsers import DiagnosticsParser, IVDiagnosticsParser, HighComplexityDiagnosticsParser

dir_path = os.path.dirname(os.path.realpath(__file__))
data_path = dir_path + "/../../data/FDA-EUA/"


def get_files_to_parse():
    files = []

    root_path = data_path + "html_pages"
    for file_name in os.listdir(root_path):
        if file_name.startswith("."):
            continue

        with open(root_path + "/" + file_name, "r") as f:
            file_contents = f.read()

        files.append({
            "file_name": file_name.replace(".htm", ""),
            "file_contents": file_contents,
        })

    return files


def preprocess_html(html):
    # simplify
    html = re.sub("</?em>", "", html)
    html = re.sub("<br />", " ", html)
    html = re.sub("\s+", " ", html)
    # normalise
    html = re.sub("None currelty", "None currently", html)
    html = re.sub("144KB0", "144KB)", html)
    html = re.sub("<span\s*class=\"file-size\">396KB\)</span>", "396KB)", html)
    html = re.sub("394KB</td>", "394KB)</td>", html)
    html = re.sub("116KB<", "116KB)<", html)
    html = re.sub('"/media/136656"', '"/media/136656/download"', html)
    html = re.sub('"/media-base/137162"', '"/media/137162/download"', html)
    html = re.sub('"/media-base/137163"', '"/media/137163/download"', html)
    html = re.sub("http://wcms-internet.fda.gov/", "/", html)

    return html


def parse_html(html):
    diagnostics_parser = DiagnosticsParser()
    diagnostics_parser.feed(html)
    diagnostics_data_rows = diagnostics_parser.rows

    return diagnostics_data_rows


def deprecated_parse_html_2020_08_18(html):
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


def deprecated_merge_data(iv_diagnostics_data_rows, high_complexity_diagnostics_data_rows):
    # skip first row as it is headers
    iv_diagnostics_data_rows = iv_diagnostics_data_rows[1:]
    high_complexity_diagnostics_data_rows = high_complexity_diagnostics_data_rows[1:]

    print("{} iv rows, {} high complexity rows parsed".format(
        len(iv_diagnostics_data_rows),
        len(high_complexity_diagnostics_data_rows),
    ))

    merged_data_rows = [
        ["test_id", "Date EUA First Issued", "manufacturer / laboratory name", "test name", "In Vitro / High Complexity"]
    ]

    for data_row in iv_diagnostics_data_rows:
        merged_data_rows.append([*data_row[0:4], "In Vitro"])

    for data_row in high_complexity_diagnostics_data_rows:
        merged_data_rows.append([*data_row[0:4], "High Complexity"])

    return merged_data_rows


def check_test_ids_are_unique(data_rows):
    # skip first row as it is headers
    data_rows = data_rows[1:]

    test_ids = set()
    duplicates = set()

    for data_row in data_rows:
        test_id = data_row[0]

        if test_id in test_ids:
            duplicates.add(test_id)
        else:
            test_ids.add(test_id)

    if duplicates:
        raise Exception("Found {} duplicates: {}".format(len(duplicates), duplicates))


def store_results(file_name, data_rows):
    json_file_path_for_parsed_data = data_path + "parsed/{}.json".format(file_name)
    with open(json_file_path_for_parsed_data, "w") as f:
        json.dump(data_rows, f, indent=4, ensure_ascii=False)


def deprecated_main_2020_08_18():
    for f in get_files_to_parse():

        file_contents = f["file_contents"]
        file_name = f["file_name"]

        html = preprocess_html(file_contents)
        results = deprecated_parse_html_2020_08_18(html)
        merged_data = deprecated_merge_data(**results)
        check_test_ids_are_unique(merged_data)

        store_results("{}_iv".format(file_name), results["iv_diagnostics_data_rows"])
        store_results("{}_high_complexity".format(file_name), results["high_complexity_diagnostics_data_rows"])
        store_results("{}_merged".format(file_name), merged_data)


def main():
    for f in get_files_to_parse():

        file_contents = f["file_contents"]
        file_name = f["file_name"]

        if file_name == "2020-08-18":
            # Skipping this file as newer parser needed to deal with new page layout
            print("skipping: " + file_name)
            continue

        html = preprocess_html(file_contents)
        results = parse_html(html)
        check_test_ids_are_unique(results)

        store_results(file_name, results)


main()
