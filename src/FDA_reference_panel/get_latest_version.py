from datetime import datetime
import os
import re

import requests

dir_path = os.path.dirname(os.path.realpath(__file__))
data_path = os.path.join(dir_path, "../../data/FDA_reference_panel")
html_pages_dir = os.path.join(data_path, "html_pages")

FDA_REFERENCE_PANEL_RESULTS_URL = "https://www.fda.gov/medical-devices/coronavirus-covid-19-and-medical-devices/sars-cov-2-reference-panel-comparative-data"
latest_file_path = html_pages_dir + "/latest.html"


def get_current_stored_latest_version():
    if not os.path.isfile(latest_file_path): return None

    with open(latest_file_path, "r") as f:
        return f.read()


def versions_are_different(version1, version2):
    return version1 != version2


def process_html(html):
    return re.sub("[ \t]+$", "", html, flags=re.M)


def get_latest_version():
    resp = requests.get(FDA_REFERENCE_PANEL_RESULTS_URL)
    resp.raise_for_status()
    raw_current_version = resp.text
    current_version = process_html(raw_current_version)

    latest_version = get_current_stored_latest_version()

    if (latest_version and not versions_are_different(latest_version, current_version)):
        return

    datetime_str = "{0:%Y-%m-%d_%H-%M-%S}".format(datetime.now())
    print("Saving new version of FDA reference panel html page on " + datetime_str)

    with open(html_pages_dir + "/{}.html".format(datetime_str), "w") as f:
        f.write(current_version)
    with open(latest_file_path, "w") as f:
        f.write(current_version)


get_latest_version()
