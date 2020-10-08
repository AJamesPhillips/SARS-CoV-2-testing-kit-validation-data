import json
import os
import re

from parsers import IVDiagnosticsParser

dir_path = os.path.dirname(os.path.realpath(__file__))

FILE_DATE = "2020-08-18"


def check_diagnostic_names_are_unique(data_rows):

    # skip first row as it is headers
    data_rows = data_rows[1:]

    diagnostic_names = set()
    duplicates = set()

    for data_row in data_rows:
        diagnostic_name = data_row[2]

        if diagnostic_name in diagnostic_names:
            duplicates.add(diagnostic_name)
        else:
            diagnostic_names.add(diagnostic_name)

    if duplicates:
        raise Exception("Found {} duplicates: {}".format(len(duplicates), duplicates))


iv_diagnostics_parser = IVDiagnosticsParser()

FDA_EUA_html_page_file_path = dir_path + "/../../data/FDA-EUA/html-page/{}.htm".format(FILE_DATE)
with open(FDA_EUA_html_page_file_path, "r") as f:
    html = f.read()

    # simplify
    html = re.sub("</?em>", "", html)
    html = re.sub("<br />", " ", html)
    html = re.sub("\s+", " ", html)
    # normalise
    html = re.sub("<span\s*class=\"file-size\">396KB\)</span>", "396KB)", html)

    iv_diagnostics_parser.feed(html)
    data_rows = iv_diagnostics_parser.rows
    check_diagnostic_names_are_unique(data_rows)

    # [print(r) for r in iv_diagnostics_parser.rows]
    print("{} rows parsed".format(len(iv_diagnostics_parser.rows)))

    json_file_path_for_parsed_data = dir_path + "/../../data/FDA-EUA/parsed/{}.json".format(FILE_DATE)
    with open(json_file_path_for_parsed_data, "w") as f:
        json.dump(data_rows, f, indent=4)

