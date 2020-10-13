from enum import Enum, auto
from html.parser import HTMLParser
import json
import os
import re
import sys

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, dir_path + "/../common")

from get_test_id import get_test_id


class ParserState(Enum):
    INACTIVE = auto()
    COLLECT_ROWS = auto()
    FINISHED = auto()


class ParserSubState(Enum):
    INACTIVE = auto()
    COLLECT_CELL = auto()


class Parser(HTMLParser):
    HEADERS = [
        "test_id",
        "Developer",
        "Test",
        "Results status",
        "Product LoD (NAAT Detectable Units / mL)",
        "Sample/media type"
    ]


    def __init__(self):
        super().__init__()
        self.reset()

        self.rows = []
        self.state = ParserState.INACTIVE
        self.table_number = 0  # table number count starts at 1
        self.substate = ParserSubState.INACTIVE


    def handle_starttag(self, tag, attrs):
        if tag == "tbody":
            self.state = ParserState.COLLECT_ROWS
            self.table_number += 1

        if self.state != ParserState.COLLECT_ROWS:
            return

        if tag == "tr":
            if self.table_number == 1:
                self.current_row = [""] * len(self.HEADERS)
                self.data_position = 0 # start at 0 which will be skipped as this is test_id
            else:
                self.temporary_row = [""] * 3 # There are the LoD, developer name and test name
                self.data_position = -1

        elif tag == "td":
            self.data_position += 1
            self.substate = ParserSubState.COLLECT_CELL


    def handle_endtag(self, tag):
        if self.state != ParserState.COLLECT_ROWS:
            return

        if tag == "td":
            self.substate = ParserSubState.INACTIVE

        elif tag == "tr":

            if self.table_number == 1:
                # Table one contains list of tests and status of their results

                test_id = get_test_id(self.current_row[1], self.current_row[2])
                self.current_row[0] = test_id
                self.rows.append(self.current_row)

            else:
                # Tables 2, 3, 4 contain the different LoD results

                row_to_update = None
                for row in self.rows:
                    test_id = row[0]

                    temp_row_developer = self.temporary_row[1]
                    temp_row_test_name = self.temporary_row[2]
                    temp_test_id = get_test_id(temp_row_developer, temp_row_test_name)

                    if test_id == temp_test_id:
                        row_to_update = row
                        break

                if not row_to_update:
                    print(json.dumps(self.rows, indent=4))
                    raise Exception("Could not match temporary_row in rows. {}".format(self.temporary_row))

                LOD_value = self.temporary_row[0]
                swab_media_type = ""
                if self.table_number == 2:
                    swab_media_type = "Swabs in Transport Media"

                elif self.table_number == 3:
                    swab_media_type = "Direct Swabs (Dry Swabs)"

                elif self.table_number == 4:
                    swab_media_type = "Saliva"

                else:
                    raise Exception("Unsupported table number: {}".format(self.table_number))

                if row_to_update[4] or row_to_update[5]:
                    print(json.dumps(self.rows, indent=4))
                    raise Exception("Already have values \"{}\" and \"{}\" for row: {} but trying to update with: \"{}\" and \"{}\"".format(row_to_update[4], row_to_update[5], row_to_update, LOD_value, swab_media_type))

                row_to_update[4] = LOD_value
                row_to_update[5] = swab_media_type

        elif tag == "tbody":
            self.state = ParserState.INACTIVE

            if self.table_number == 1:
                self.rows = sorted(self.rows, key=lambda row: row[0])

            if self.table_number == 4:
                self.rows.insert(0, self.HEADERS)
                self.state = ParserState.FINISHED


    def handle_data(self, data):
        if (self.state != ParserState.COLLECT_ROWS or
            self.substate != ParserSubState.COLLECT_CELL):
            return

        data = data.strip()
        # For the moment, just drop this extra data
        data = re.sub("\*+", "", data)

        if self.table_number == 1:
            row_to_update = self.current_row
        else:
            row_to_update = self.temporary_row

        # Quick hack to protect from overwriting data with superscripts
        if row_to_update[self.data_position]:
            return
        row_to_update[self.data_position] = data

