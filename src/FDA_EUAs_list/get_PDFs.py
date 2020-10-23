import os
import re
import requests
import sys
import time

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, dir_path + "/..")

from common import get_fda_eua_parsed_data, filter_for_urls, get_FDA_EUA_pdf_file_path_from_FDA_url


DELAY_SECONDS_BETWEEN_REQUESTS = 2


def check_urls_are_unique(urls):
    duplicated_urls = []
    known_duplicate_urls = [
        "https://www.fda.gov/media/137741/download",  # error?
        "https://www.fda.gov/media/140715/download",  # error?
        "https://www.fda.gov/media/137181/download",  # ok?
        "https://www.fda.gov/media/137355/download",  # error - QIAstat Letter Granting EUA Amendments (April 23, 2020) points to one for NeuMoDx Molecular, Inc.
        "https://www.fda.gov/media/136599/download",  # ok - points to generic info
        "https://www.fda.gov/media/136600/download",  # ok - points to generic info
        "https://www.fda.gov/media/142307/download",  # error - Should be GK Accu-Right HCP doc but is their letter of authorization
        "https://www.fda.gov/media/142421/download",  # error - Orawell IgM/IgG Rapid Test has this for HCP and Recipient
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

        file_path = get_FDA_EUA_pdf_file_path_from_FDA_url(url)

        if os.path.isfile(file_path):
            print("Skipping " + url)
            continue

        print("Downloading " + url)
        request = requests.get(url)
        with open(file_path, "wb") as f:
            f.write(request.content)

        time.sleep(DELAY_SECONDS_BETWEEN_REQUESTS)


def deprecated_main():
    fda_eua_parsed_data = deprecated_get_fda_eua_parsed_data(merged=False)
    urls = filter_for_urls(fda_eua_parsed_data["fda_eua_iv_parsed_data"])
    urls += filter_for_urls(fda_eua_parsed_data["fda_eua_high_complexity_parsed_data"])
    print("Extracted {} urls to download".format(len(urls)))
    check_urls_are_unique(urls)
    download_urls(urls)


def main():
    fda_eua_parsed_data = get_fda_eua_parsed_data()
    urls = filter_for_urls(fda_eua_parsed_data)
    print("Extracted {} urls to download".format(len(urls)))
    check_urls_are_unique(urls)
    download_urls(urls)


main()
