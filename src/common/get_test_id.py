import re


def get_test_id(manufacturer_or_lab_name, test_name):
    manufacturer_or_lab_name = manufacturer_or_lab_name.lower()
    test_name = test_name.lower()

    manufacturer_or_lab_name = re.sub("inc\.*", "inc.", manufacturer_or_lab_name)

    test_id = manufacturer_or_lab_name + "__" + test_name
    return test_id
