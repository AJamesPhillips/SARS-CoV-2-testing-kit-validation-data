from enum import Enum, auto
from html.parser import HTMLParser
import json
import os
import re
import sys

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, dir_path + "/../common")

from get_test_id import get_test_id
from parser import Parser


dir_path = os.path.dirname(os.path.realpath(__file__))
data_path = os.path.join(dir_path, "../../data/FDA_reference_panel")
html_pages_dir = os.path.join(data_path, "html_pages")
parsed_dir = os.path.join(data_path, "parsed")


def parse_html(html):
    parser = Parser()
    parser.feed(html)
    return parser.rows


def parse_versions():
    file_names = os.listdir(html_pages_dir)

    for file_name in file_names:
        print("Parsing FDA reference panel html: {}".format(file_name))
        with open(html_pages_dir + "/" + file_name, "r") as f:
            contents = f.read()

        parsed_result = parse_html(contents)
        extracted_rows_number = len(parsed_result) - 1 # subtract 1 for headers
        print("Extracted {} rows".format(extracted_rows_number))

        output_file_name = file_name.replace(".html", ".json")
        with open(parsed_dir + "/" + output_file_name, "w") as f:
            json.dump(parsed_result, f, indent=2)


parse_versions()
