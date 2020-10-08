from enum import Enum, auto


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
