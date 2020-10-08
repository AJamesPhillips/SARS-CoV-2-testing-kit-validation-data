from html.parser import HTMLParser

from parsers.common import get_test_id, ParserState, ParserSubState, parse_date


class IVDiagnosticsParser(HTMLParser):
    HEADERS = [
        "test_id",
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


    def __init__(self):
        super().__init__()
        self.reset()

        self.rows = []
        self.state = ParserState.INACTIVE
        self.table_number = 0  # table number count starts at 1
        self.substate = ParserSubState.INACTIVE

        self.current_row = None
        self.current_a_tag = None
        self.current_a_tag_url = None

        self.current_row_manufacturer_name = None
        self.current_row_test_name = None


    def handle_starttag(self, tag, attrs):
        if tag == "tbody" and self.state != ParserState.FINISHED:
            self.state = ParserState.COLLECT_ROWS

        if self.state != ParserState.COLLECT_ROWS:
            return

        self.current_a_tag = None
        self.current_a_tag_url = None

        # print("Got tag: ", tag)
        if tag == "tr":
            self.current_row = [""] * len(self.HEADERS)
            self.current_row[9] = []
            self.current_row[11] = []
            self.data_position = -1

        elif tag == "td":
            self.data_position += 1
            self.substate = ParserSubState.COLLECT_CELL
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
        if self.state != ParserState.COLLECT_ROWS:
            return

        if tag == "td":
            self.substate = ParserSubState.INACTIVE

        elif tag == "tr":
            test_id = get_test_id(self.current_row_manufacturer_name, self.current_row_test_name)
            self.current_row[0] = test_id
            self.rows.append(self.current_row)
            self.current_row = None

            # temp
            # self.state = ParserState.FINISHED

        elif tag == "tbody":
            self.state = ParserState.FINISHED
            self.rows = sorted(self.rows, key=lambda row: row[1])
            self.rows.insert(0, self.HEADERS)


    def handle_data(self, data):
        data = data.strip()

        if (self.state != ParserState.COLLECT_ROWS or
            self.substate != ParserSubState.COLLECT_CELL):
            return

        if self.data_position == 0:
            if self.current_row[1]:
                raise Exception("Only expecting one value for date")
            self.current_row[1] = parse_date(data)

        elif self.data_position == 1:
            if self.current_row[2]:
                raise Exception("Only expecting one value for Entity name")
            self.current_row[2] = data
            self.current_row_manufacturer_name = data

        elif self.data_position == 2:

            if self.data_subposition == 0:
                if self.current_row[3]:
                    raise Exception("Only expecting one value for Test name")
                self.current_row[3] = data
                self.current_row_test_name = data
                self.current_row[4] = self.current_a_tag_url
            elif self.data_subposition == 1:
                pass
            else:
                raise Exception("Only expecting two subvalues for Test name")

            self.data_subposition += 1

        # Technology
        elif self.data_position == 3:
            if self.current_row[5]:
                raise Exception("Only expecting one value for Technology")
            self.current_row[5] = data

        # Authorised Settings
        elif self.data_position == 4:
            if self.current_row[6]:
                raise Exception("Only expecting one value for Authorised Settings")
            self.current_row[6] = data

        # Authorization Labeling & "extra"
        elif self.data_position == 5:
            if data == "HCP":
                if self.current_row[7]:
                    raise Exception("Only expecting one value for HCP Fact Sheet URL")
                self.current_row[7] = self.current_a_tag_url
            elif "Patient" in data or data == "Recipients":
                if not self.current_row[8]:
                    self.current_row[8] = self.current_a_tag_url
                else:
                    print("Warning: multiple values for Patient / Recipients Fact Sheet URL")

            elif "IFU" in data:
                # if len(self.current_row[8]):
                #     print("Warning: multiple values for IFU URL for " + self.current_row[1])
                self.current_row[9].append(self.current_a_tag_url)
            elif data == "EUA Summary":
                if self.current_row[10]:
                    raise Exception("Only expecting one value for EUA Summary URL")
                self.current_row[10] = self.current_a_tag_url
            elif "B)" in data:
                pass
            elif data:
                print("Unparsed data", data)

        elif self.data_position == 6:
            if not self.current_a_tag_url:
                if "None currently" in data:
                    pass
                elif not data:
                    pass
                else:
                    print("Have unexpected text for \"Amendments and Other Documents\" field: ", data)
            else:
                if "None currently" in data:
                    print("Have unexpected url in \"Amendments and Other Documents\" field: ", self.current_a_tag_url)
                elif "B)" in data:
                    pass
                elif data:
                    self.current_row[11].append(self.current_a_tag_url)

        elif self.data_position == 7:
            pass

        else:
            pass
            print("Encountered some data  :", self.data_position, self.current_a_tag, data)
