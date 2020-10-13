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


def normalise_html(html):
    html = html.replace("KPMAS COVID-19 Test (104KB)", "KPMAS COVID-19 Test")
    html = html.replace("Gravity Diagnostics COVID-19 Assay (370KB)", "Gravity Diagnostics COVID-19 Assay")
    return html


def parse_html(html):
    parser = Parser()
    parser.feed(html)
    return parser.rows



map_reference_panel_test_id_to_EUA_list_test_id = {
    "centers for disease control and prevention (cdc)__cdc 2019-ncov real-time rt-pcr diagnostic panel (cdc)":
    "cdc__cdc 2019-novel coronavirus (2019-ncov) real-time rt-pcr diagnostic panel",

    "wadsworth center, new york state department of public health__new york sars-cov-2 real-time reverse transcriptase (rt)-pcr diagnostic panel":
    "wadsworth center, new york state department of health's (cdc)__new york sars-cov-2 real-time reverse transcriptase (rt)-pcr diagnostic panel",

    "life technologies (a part of thermo fisher scientific, inc.)__taqpath covid-19 combo kit, 100 rxn, taqpath covid-19 combo kit, 1,000 rxn": "thermo fisher scientific, inc.__taqpath covid-19 combo kit",

    "biofire diagnostics, llc__biofire respiratory panel 2.1-ez (rp2.1-ez)": "biofire diagnostics, llc__biofire respiratory panel 2.1 (rp2.1)",

    "quadrant biosciences inc.__clarifi covid-19 test kit": "quadrant biosciences inc.__clarifi covid-19 test kit 09/22/2020",

    "zhuhai sinochips bioscience co., ltd__covid-19 nucleic acid rt-pcr test kit": "zhuhai sinochips bioscience co., ltd.__covid-19 nucleic acid rt-pcr test kit",

    "diacarta, inc__quantivirus sars-cov-2 multiplex test kit": "diacarta, inc.__quantivirus sars-cov-2 multiplex test kit",

    "acupath laboratories, inc__acupath covid-19 real-time (rt-pcr) assay": "acupath laboratories, inc.__acupath covid-19 real-time (rt-pcr) assay",

    "plexbio co., ltd.__intelliplex sars-cov-2 detection kit": "plexbio co., ltd__intelliplex sars-cov-2 detection kit",

    "euroimmun us, inc.__eurorealtime sars-cov-2": "euroimmun us inc.__eurorealtime sars-cov-2",

    "aspirus reference laboratory__aspirus sars-cov rrt assay": "aspirus reference laboratory__aspirus sars-cov-2 rrt assay",

    "fast track diagnostics luxembourg s.á.r.l. (a siemens healthineers company)__ftd sars-cov-2": "fast track diagnostics luxembourg s.á.r.l. (a siemens healthineers company)__ftd sars-cov-2",

    "dba spectronrx__hymon sars-cov-2 test kit": "dba spectronrx__hymon sars-cov-2 test kit",

    "seasun biomaterials, inc.__aq-top covid-19 rapid detection kit": "seasun biomaterials, inc.__aq-top covid-19 rapid detection",

    "solgent co., ltd__diaplexq novel coronavirus (2019-ncov) detection kit": "solgent co., ltd.__diaplexq novel coronavirus (2019-ncov) detection kit",

    "primerdesign ltd.__primerdesign ltd covid-19 genesig real-time pcr assay": "primerdesign ltd__primerdesign ltd covid-19 genesig real-time pcr assay",

    "mesa biotech inc__accula sars-cov-2 test": "mesa biotech inc.__accula sars-cov-2 test",

    "yale new haven hospital, clinical virology laboratory__sars-cov-2 pcr test": "yale new haven hospital, clinical virology laboratory__sars-cov-2 pcr test",

    "diagnostic molecular laboratory - northwestern medicine__sars-cov-2 assay": "diagnostic molecular laboratory - northwestern medicine__sars-cov-2 assay",

    "inbios international, inc__smart detect sars-cov-2 rrt-pcr kit": "inbios international, inc.__smart detect sars-cov-2 rrt-pcr kit",

    "becton, dickinson & company__bd sars-cov-2 reagents for bd max system": "becton, dickinson & company__bd sars-cov-2reagents for bd max system",

    "diacarta, inc__quantivirus sars-cov-2 test kit": "diacarta, inc.__quantivirus sars-cov-2 test kit",

    "infinity biologix llc (formerly rutgers clinical genomics laboratory at rucdr infinite biologics - rutgers university)__infinity biologix taqpath sars-cov-2 assay (formerly rutgers clinical genomics laboratory taqpath sars-cov-2-assay)": "infinity biologix llc__infinity biologix taqpath sars-cov-2 assay 04/10/2020",

    "specialty diagnostic (sdi) laboratories__sdi sars-cov-2 assay": "specialty diagnostic (sdi) laboratories__sdi sars-cov-2 assayletter granting inclusion",

    "integrity laboratories__sars-cov-2 assay": "integrity laboratories__sars-cov-2 assay",

    "fosun pharma usa inc..__fosun covid-19 rt-pcr detection kit": "fosun pharma usa inc.__fosun covid-19 rt-pcr detection kit",

    "altona diagnostics gmbh__realstar sars-cov-2 rt-pcr kit u.s.": "altona diagnostics gmbh__realstar sars-cov02 rt-pcr kits u.s.",

    "nationwide children's hospital__sars-cov-2 assay": "nationwide children’s hospital__sars-cov-2 assay",

    "bio-rad laboratories, inc__bio-rad sars-cov-2 ddpcr test": "bio-rad laboratories, inc.__bio-rad sars-cov-2 ddpcr test",

    "biofire diagnostics, llc__biofire respiratory panel 2.1-ez (rp2.1-ez)": "biofire diagnostics, llc__biofire respiratory panel 2.1 (rp2.1)",

    "opti medical systems, inc.__opti sars-cov-2 rt pcr test": "opti medical systems, inc.__opti sars-cov-2 rt pcr test",

    "color genomics, inc.__color genomics sars-cov-2 rt-lamp diagnostic assay": "color genomics, inc.__color genomics sars-cov-2 rt-lamp diagnostic assay (reissued july 24, 2020)",
}
def map_test_ids(parsed_result):
    # Ignore headers
    parsed_result = parsed_result[1:]

    for row in parsed_result:
        test_id = row[0]

        if test_id in map_reference_panel_test_id_to_EUA_list_test_id:
            test_id = map_reference_panel_test_id_to_EUA_list_test_id[test_id]
            row[0] = test_id


def parse_versions():
    file_names = os.listdir(html_pages_dir)

    for file_name in file_names:
        print("Parsing FDA reference panel html: {}".format(file_name))
        with open(html_pages_dir + "/" + file_name, "r") as f:
            contents = f.read()

        contents = normalise_html(contents)

        parsed_result = parse_html(contents)
        extracted_rows_number = len(parsed_result) - 1 # subtract 1 for headers
        print("Extracted {} rows".format(extracted_rows_number))

        map_test_ids(parsed_result)

        output_file_name = file_name.replace(".html", ".json")
        with open(parsed_dir + "/" + output_file_name, "w") as f:
            json.dump(parsed_result, f, indent=2, ensure_ascii=False)


parse_versions()
