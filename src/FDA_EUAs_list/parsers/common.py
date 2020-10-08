from enum import Enum, auto
import os
import sys

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, dir_path + "/../../common")

from get_test_id import get_test_id


def parse_date(date_str):
    date_parts = [part for part in date_str.split("/")]
    return "{}-{}-{}".format(date_parts[2], date_parts[0], date_parts[1])


class ParserState(Enum):
    INACTIVE = auto()
    COLLECT_ROWS = auto()
    FINISHED = auto()


class ParserSubState(Enum):
    INACTIVE = auto()
    COLLECT_CELL = auto()
