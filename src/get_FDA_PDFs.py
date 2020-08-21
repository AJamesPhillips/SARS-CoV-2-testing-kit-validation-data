import json
import os
import re
import requests
import time


dir_path = os.path.dirname(os.path.realpath(__file__))
FILE_DATE = "2020-08-18"
DELAY_SECONDS_BETWEEN_REQUESTS = 2


def get_data():
    json_file_path_for_parsed_data = dir_path + "/../data/FDA-EUA/parsed/{}.json".format(FILE_DATE)
    with open(json_file_path_for_parsed_data, "r") as f:
        data = json.load(f)

    return data


def filter_for_urls(data):
    urls = []

    if isinstance(data, list):
        for v in data:
            urls += filter_for_urls(v)
    elif isinstance(data, str) and re.match(r'^https?://', data):
        urls.append(data)

    return urls


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

        matches = re.match("https://www.fda.gov/media/(\d+)/download", url)
        file_id = matches.groups()[0]
        file_path = dir_path + "/../data/FDA-EUA/PDFs/{}.pdf".format(file_id)

        if os.path.isfile(file_path):
            print("Skipping " + url)
            continue

        print("Downloading " + url)
        request = requests.get(url)
        with open(file_path, "wb") as f:
            f.write(request.content)

        time.sleep(DELAY_SECONDS_BETWEEN_REQUESTS)


def main():
    data = get_data()
    urls = filter_for_urls(data)
    check_urls_are_unique(urls)
    download_urls(urls)


main()
