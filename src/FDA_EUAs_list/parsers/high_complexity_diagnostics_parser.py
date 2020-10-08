from html.parser import HTMLParser

from parsers.common import ParserState, ParserSubState, parse_date


class HighComplexityDiagnosticsParser(HTMLParser):
    table_number = 0
    state = ParserState.INACTIVE
    substate = ParserSubState.INACTIVE

    current_row = None
    current_a_tag = None
    current_a_tag_url = None
    HEADERS = [
        "Date EUA First Issued",
        "Laboratory name",
        "Test name",
        #"Letters of Authorization (URLs to PDFs)",
        "Emergency Use Authorisation (URL to PDF)",
    ]
    rows = []

    def handle_starttag(self, tag, attrs):
        if tag == "tbody" and self.state != ParserState.FINISHED:
            self.table_number += 1
            if (self.table_number == 2):
                self.state = ParserState.COLLECT_ROWS

        if self.state != ParserState.COLLECT_ROWS:
            return

        self.current_a_tag = None
        self.current_a_tag_url = None

        # print("Got tag: ", tag)
        if tag == "tr":
            self.current_row = [""] * len(self.HEADERS)
            #self.current_row[3] = []
            self.data_position = -1

        elif tag == "td":
            self.data_position += 1
            self.substate = ParserSubState.COLLECT_CELL

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
            self.rows.append(self.current_row)
            self.current_row = None

        elif tag == "tbody":
            self.state = ParserState.FINISHED
            self.rows = sorted(self.rows, key=lambda row: row[0])
            self.rows.insert(0, self.HEADERS)


    def handle_data(self, data):
        if (self.state != ParserState.COLLECT_ROWS or
            self.substate != ParserSubState.COLLECT_CELL):
            return

        if self.data_position == 0:
            if self.current_row[0]:
                raise Exception("Only expecting one value for date")
            self.current_row[0] = parse_date(data)

        elif self.data_position == 1:
            if self.current_row[1]:
                raise Exception("Only expecting one value for Laboratory name")
            self.current_row[1] = data.strip()

        # Test name
        elif self.data_position == 2:
            data = data.strip()
            if self.current_row[2]:
                return
            if data:
                self.current_row[2] = data

        elif self.data_position == 3:
            if data == "EUA Summary":
                if self.current_row[3]:
                    raise Exception("Only expecting one value for EUA Summary URL")
                self.current_row[3] = self.current_a_tag_url
            elif "B)" in data:
                pass
            elif data.strip():
                print("Unparsed data", data)

        else:
            pass
            print("Encountered some unexpected data  :", self.data_position, self.current_a_tag, data)