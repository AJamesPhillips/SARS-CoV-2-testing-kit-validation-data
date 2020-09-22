from enum import Enum, auto
from html.parser import HTMLParser
import json
import os
import re

dir_path = os.path.dirname(os.path.realpath(__file__))

FILE_DATE = "2020-08-18"


def parse_date(date_str):
    date_parts = [part for part in date_str.split("/")]
    return "{}-{}-{}".format(date_parts[2], date_parts[0], date_parts[1])


class IVParserState(Enum):
    INACTIVE = auto()
    COLLECT_ROWS = auto()
    FINISHED = auto()


class IVParserSubState(Enum):
    INACTIVE = auto()
    COLLECT_CELL = auto()


class IVParser(HTMLParser):
    state = IVParserState.INACTIVE
    substate = IVParserSubState.INACTIVE

    current_row = None
    current_a_tag = None
    current_a_tag_url = None
    HEADERS = [
        "Date EUA First Issued",
        "Entity",
        "Diagnostic name",
        "Most Recent Letter of Authorization (URL to PDF)",
        "Technology",
        "Authorized Setting(s)",
        "Fact Sheet for Healthcare Providers (HCP) (URL to PDF)",
        "Fact Sheet for Patients / Recipients (URL to PDF)",
        "Information for Use (IFU) (URL to PDF)",
        "Emergency Use Authorisation (URL to PDF)",
        "Amendments and Other Documents (PDF)",
        "Federal Register Notice for EUA",
    ]
    rows = []

    def handle_starttag(self, tag, attrs):
        if tag == "tbody" and self.state != IVParserState.FINISHED:
            self.state = IVParserState.COLLECT_ROWS

        if self.state != IVParserState.COLLECT_ROWS:
            return

        self.current_a_tag = None
        self.current_a_tag_url = None

        # print("Got tag: ", tag)
        if tag == "tr":
            self.current_row = [None] * len(self.HEADERS)
            self.current_row[10] = []
            self.data_position = -1

        elif tag == "td":
            self.data_position += 1
            self.substate = IVParserSubState.COLLECT_CELL
            self.data_subposition = 0

        elif tag == "a":
            self.current_a_tag = attrs
            self.current_a_tag_url = next(x[1] for x in self.current_a_tag if x[0] == "href")
            if self.current_a_tag_url.startswith("/"):
                self.current_a_tag_url = "https://www.fda.gov" + self.current_a_tag_url

        else:
            pass
            # print("Got tag: ", tag)


    def handle_endtag(self, tag):
        if self.state != IVParserState.COLLECT_ROWS:
            return

        if tag == "td":
            self.substate = IVParserSubState.INACTIVE

        elif tag == "tr":
            self.rows.append(self.current_row)
            self.current_row = None

            # temp
            # self.state = IVParserState.FINISHED

        elif tag == "tbody":
            self.state = IVParserState.FINISHED
            self.rows = sorted(self.rows, key=lambda row: row[0])
            self.rows.insert(0, self.HEADERS)


    def handle_data(self, data):
        if (self.state != IVParserState.COLLECT_ROWS or
            self.substate != IVParserSubState.COLLECT_CELL):
            return

        if self.data_position == 0:
            if self.current_row[0] is not None:
                raise Exception("Only expecting one value for date")
            self.current_row[0] = parse_date(data)

        elif self.data_position == 1:
            if self.current_row[1] is not None:
                raise Exception("Only expecting one value for Entity name")
            self.current_row[1] = data

        elif self.data_position == 2:

            if self.data_subposition == 0:
                if self.current_row[2] is not None:
                    raise Exception("Only expecting one value for Test name")
                self.current_row[2] = data
                self.current_row[3] = self.current_a_tag_url
            elif self.data_subposition == 1:
                pass
            else:
                raise Exception("Only expecting two subvalues for Test name")

            self.data_subposition += 1

        # Technology
        elif self.data_position == 3:
            if self.current_row[4] is not None:
                raise Exception("Only expecting one value for Technology")
            self.current_row[4] = data

        # Authorised Settings
        elif self.data_position == 4:
            if self.current_row[5] is not None:
                raise Exception("Only expecting one value for Authorised Settings")
            self.current_row[5] = data

        # Authorization Labeling & "extra"
        elif self.data_position == 5:
            if data == "HCP":
                if self.current_row[6] is not None:
                    raise Exception("Only expecting one value for HCP Fact Sheet URL")
                self.current_row[6] = self.current_a_tag_url
            elif "Patient" in data or data == "Recipients":
                if self.current_row[7] is None:
                    self.current_row[7] = self.current_a_tag_url
                else:
                    print("Warning: multiple values for Patient / Recipients Fact Sheet URL")
                    if not isinstance(self.current_row[7], list):
                        self.current_row[7] = [self.current_row[7]]
                    self.current_row[7].append(self.current_a_tag_url)

            elif "IFU" in data:
                if self.current_row[8] is not None:
                    print("Warning: multiple values for IFU URL")
                self.current_row[8] = self.current_a_tag_url
            elif data == "EUA Summary":
                if self.current_row[9] is not None:
                    raise Exception("Only expecting one value for EUA Summary URL")
                self.current_row[9] = self.current_a_tag_url
            elif "B)" in data:
                pass
            elif data.strip():
                print("Unparsed data", data)

        elif self.data_position == 6:
            if self.current_a_tag_url is None:
                if "None currently" in data:
                    pass
                elif not data.strip():
                    pass
                else:
                    print("Have unexpected text for \"Amendments and Other Documents\" field: ", data)
            else:
                if "None currently" in data:
                    print("Have unexpected url in \"Amendments and Other Documents\" field: ", self.current_a_tag_url)
                elif "B)" in data:
                    pass
                elif data.strip():
                    self.current_row[10].append(self.current_a_tag_url)

        elif self.data_position == 7:
            pass

        else:
            pass
            print("Encountered some data  :", self.data_position, self.current_a_tag, data)


iv_parser = IVParser()

FDA_EUA_html_page_file_path = dir_path + "/../data/FDA-EUA/html-page/{}.htm".format(FILE_DATE)
with open(FDA_EUA_html_page_file_path, "r") as f:
    html = f.read()

    # simplify
    html = re.sub("\s*</?em>\s*", " ", html)
    html = re.sub("<br />", " ", html)
    html = re.sub("\s+", " ", html)
    # normalise
    html = re.sub("<span\s*class=\"file-size\">396KB\)</span>", "396KB)", html)

    iv_parser.feed(html)

    # [print(r) for r in iv_parser.rows]
    print("{} rows parsed".format(len(iv_parser.rows)))

    json_file_path_for_parsed_data = dir_path + "/../data/FDA-EUA/parsed/{}.json".format(FILE_DATE)
    with open(json_file_path_for_parsed_data, "w") as f:
        f.write(json.dumps(iv_parser.rows, indent=4))


