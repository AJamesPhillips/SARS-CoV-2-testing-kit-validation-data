import os
import re
import requests
import sys
import time

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, dir_path + "/..")

from common import get_fda_eua_parsed_data, filter_for_urls, get_FDA_EUA_pdf_file_path_from_url


DELAY_SECONDS_BETWEEN_REQUESTS = 2


def check_urls_are_unique(urls):
    duplicated_urls = []
    known_duplicate_urls = [
        "https://www.fda.gov/media/137741/download",  # error?
        "https://www.fda.gov/media/140715/download",  # error?
        "https://www.fda.gov/media/137181/download",  # ok?
    ]
    unique_urls = set()
    for url in urls:
        if url in unique_urls and url not in known_duplicate_urls:
            duplicated_urls.append(url)
        else:
            unique_urls.add(url)

    if duplicated_urls:
        raise Exception("ERROR: not all urls are unique: ", duplicated_urls)


def download_urls(urls):
    for url in urls:

        file_path = get_FDA_EUA_pdf_file_path_from_url(url)

        if os.path.isfile(file_path):
            print("Skipping " + url)
            continue

        print("Downloading " + url)
        request = requests.get(url)
        with open(file_path, "wb") as f:
            f.write(request.content)

        time.sleep(DELAY_SECONDS_BETWEEN_REQUESTS)


def main():
    fda_eua_parsed_data = get_fda_eua_parsed_data(merged=False)
    urls = filter_for_urls(fda_eua_parsed_data)
    check_urls_are_unique(urls)
    download_urls(urls)


main()
