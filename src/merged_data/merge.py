##
#
# Merges data from:
#   * FDA EUA json
#   * annotations made on the FDA EUA PDFs
#   # FDA reference panel LoD data
#
##
import json
import math
import os
import sys

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, dir_path + "/..")


from common import (
    DATA_FILE_PATH_merged_data,
    get_fda_eua_parsed_data,
    get_annotation_files_by_test_id,
    get_annotations_by_label_id,
    get_fda_reference_panel_lod_data_by_test_id,
)


class Labels:
    claims__controls__internal__human_gene_target = 83
    claims__limit_of_detection__minimum_replicates = 68
    claims__limit_of_detection__value = 66
    claims__limit_of_detection__units = 67
    claims__primers_and_probes__sequences = 78
    claims__primers_and_probes__sources = 79
    claims__reaction_volume_uL = 72
    claims__specimen__supported_types = 0
    claims__specimen__transport_medium = 34
    claims__target_viral_genes = 6
    meta__error = 74
    meta__not_specified = 73
    meta__not_specified__partial_info = 109
    meta__potential_error = 99
    metrics__confusion_matrix__false_negatives = 42
    metrics__confusion_matrix__false_positives = 44
    metrics__confusion_matrix__true_negatives = 43
    metrics__confusion_matrix__true_positives = 41
    # metrics__num_clinical_samples__negative_controls = -1
    # metrics__num_clinical_samples__positive = -1
    synthetic_specimen_virus_type_Naked_RNA = 112
    synthetic_specimen_virus_type_Antigens = 113
    synthetic_specimen_virus_type_Synthetic_Viral_Particles = 114
    synthetic_specimen_virus_type_Inactivated_Virus__Heat = 115
    synthetic_specimen_virus_type_Inactivated_Virus__Gammma = 116
    synthetic_specimen_virus_type_Inactivated_Virus__Chemical = 117
    synthetic_specimen_virus_type_Live_Virus = 118
    synthetic_specimen_virus_type_Inactivated_Virus__method_not_specified = 119
    synthetic_specimen_virus_type_Partial_Live_Virus = 120
    test_descriptor__manufacturer_name = 111
    test_descriptor__test_name = 110
    test_technology = 7
    validation_condition__author = 24
    # validation_condition__comparator_test = -1
    validation_condition__date = 25
    # validation_condition__sample_volume = -1
    # validation_condition__specimen_type = -1
    # validation_condition__swab_type = -1
    validation_condition__synthetic_specimen__clinical_matrix = 64
    validation_condition__synthetic_specimen__clinical_matrix_source = 86
    validation_condition__synthetic_specimen__viral_material = 62
    validation_condition__synthetic_specimen__viral_material_source = 63
    # validation_condition__transport_medium = -1

    error_label_ids = set([
        meta__not_specified,
        meta__not_specified__partial_info,
        meta__error,
        meta__potential_error,
    ])

    viral_material_type_label_ids = set([
        synthetic_specimen_virus_type_Naked_RNA,
        synthetic_specimen_virus_type_Antigens,
        synthetic_specimen_virus_type_Synthetic_Viral_Particles,
        synthetic_specimen_virus_type_Inactivated_Virus__Heat,
        synthetic_specimen_virus_type_Inactivated_Virus__Gammma,
        synthetic_specimen_virus_type_Inactivated_Virus__Chemical,
        synthetic_specimen_virus_type_Inactivated_Virus__method_not_specified,
        synthetic_specimen_virus_type_Live_Virus,
        synthetic_specimen_virus_type_Partial_Live_Virus,
    ])


def annotation_contains_error_labels (annotation):
    for label in annotation["labels"]:
        if label["id"] in Labels.error_label_ids:
            return True


def get_lod_value (annotations_by_label_id):
    annotations_lod_value = annotations_by_label_id.get(Labels.claims__limit_of_detection__value, [])

    min_value = math.inf
    max_value = -math.inf
    min_annotation = None
    max_annotation = None

    for annotation in annotations_lod_value:
        allowed_to_fail_silently = False
        allowed_to_fail_silently = annotation_contains_error_labels(annotation)

        try:
            v = float(annotation["text"])
        except Exception as e:
            if allowed_to_fail_silently:
                continue
            else:
                print(annotation)
                raise e

        new_min = min(min_value, v)
        new_max = max(max_value, v)

        if new_min != min_value:
            min_value = new_min
            min_annotation = annotation

        if new_max != max_value:
            max_value = new_max
            max_annotation = annotation

    if not min_annotation:
        return {
            "annotations": [],
            "data": { "min": False, "max": False },
        }

    same = min_value == max_value

    annotations = [min_annotation] if same else [min_annotation, max_annotation]

    return { "annotations": annotations, "data": { "min": min_value, "max": max_value } }


def get_lod_units (annotations_by_label_id):
    annotations_lod_units = annotations_by_label_id.get(Labels.claims__limit_of_detection__units, [])
    return get_value_from_annotations(annotations_lod_units, expect_single_value=True)


def get_value_from_annotations (annotations, expect_single_value):
    if expect_single_value and len(annotations) > 1:
        print("Warning: More than 1 annotation: ", json.dumps(annotations, indent=4, ensure_ascii=False))

    value = ", ".join([an["text"] for an in annotations])

    return { "annotations": annotations, "data": { "value": value } }


def get_synthetic_specimen__viral_material (annotations_by_label_id):
    annotations = annotations_by_label_id.get(Labels.validation_condition__synthetic_specimen__viral_material, [])

    types = []

    for annotation in annotations:
        for label in annotation["labels"]:
            if label["id"] in Labels.viral_material_type_label_ids:
                parts = label["text"].split("/")
                types.append(parts[-1])

    return { "annotations": annotations, "data": { "types": types } }


# Tests not present on the FDA reference panel website as of 2020-10-13
# https://www.fda.gov/medical-devices/coronavirus-covid-19-and-medical-devices/sars-cov-2-reference-panel-comparative-data
temporary_test_ids_not_in_fda_reference_panel_lod_data = set([
    "helix opco llc (dba helix)__helix covid-19 ngs test",
    "abbott diagnostics scarborough, inc.__binaxnow covid-19 ag card",

    "university of california, los angeles (ucla)__ucla swabseq covid-19 diagnostic platform",
    "zeus scientific, inc.__zeus elisa sars-cov-2 igg test system",
    "thermo fisher scientific__omnipath covid-19 total antibody elisa test",
    "quidel corporation__sofia 2 flu + sars antigen fia",
    "tempus labs, inc.__ic sars-cov2 test",
    "beckman coulter, inc.__access il-6",
    "umass memorial medical center__umass molecular virology laboratory 2019-ncov rrt-pcr dx panel",
    "aeon global health__aeon global health sars-cov-2 assay",
    "alimetrix, inc.__alimetrix sars-cov-2 rt-pcr assay",
    "akron children’s hospital__akron children’s hospital sars-cov-2 assay",
    "centogene us, llc__centosure sars-cov-2 rt-pcr assay",
    "nirmidas biotech, inc.__nirmidas covid-19 (sars-cov-2) igm/igg antibody detection kit",
    "nanoentek america, inc.__frend covid-19 total ab",
    "diasorin, inc.__diasorin liaison sars-cov-2 igm assay",
    "quotient suisse sa__mosaiq covid-19 antibody magazine",
    "genetrack biolabs, inc.__genetrack sars-cov-2 molecular assay",
    "cepheid__xpert xpress sars-cov-2/flu/rsv 09/24/2020",
    "university of california san diego health__ucsd rc sars-cov-2 assay",
    "poplar healthcare__poplar sars-cov-2 tma pooling assay",
    "ispm labs, llc dba capstone healthcare__genus sars-cov-2 assay",
    "alpha genomix laboratories__alpha genomix taqpath sars-cov-2 combo assay",
    "lumiradx uk ltd.__lumiradx sars-cov-2 ag test",
    "texas department of state health services, laboratory services section__texas department of state health services (dshs) sars-cov-2 assay",
    "dxterity diagnostics, inc.__dxterity sars-cov-2 rt-pcr test",
    "guardant health, inc.__guardant-19",
    "qdx pathology services__qdx sars-cov-2 assay",
    "cuur diagnostics__cuur diagnostics sars-cov-2 molecular assay",
    "dxterity diagnostics, inc.__dxterity sars-cov-2 rt pcr ce test",
    "baycare laboratories, llc__baycare sars-cov-2 rt pcr assay",
    "mammoth biosciences, inc.__sars-cov-2 detectr reagent kit",
    "miradx__miradx sars-cov-2 rt-pcr assay",
    "t2 biosystems, inc.__t2sars-cov-2 panel",
    "color genomics, inc.__color covid-19 test self-swab collection kit",
    "optolane technologies, inc.__kaira 2019-ncov detection kit",
    "detectachem inc.__mobiledetect bio bcc19 (md-bio bcc19) test kit",
    "bioeksen r&d technologies ltd.__bio-speedy direct rt-qpcr sars-cov-2",
    "billiontoone, inc.__qsanger-covid-19 assay",
    "verily life sciences__verily covid-19 rt-pcr test",
    "beijing wantai biological pharmacy enterprise co., ltd.__wantai sars-cov-2 ab elisa",
    "beijing wantai biological pharmacy enterprise co., ltd.__wantai sars-cov-2 rt-pcr kit",
    "visby medical, inc.__visby medical covid-19",
    "gk pharmaceuticals contract manufacturing operations__gk accu-right sars-cov-2 rt-pcr kit",
    "diasorin molecular llc__simplexa covid-19 direct",
    "kimforest enterprise co., ltd.__kimforest sars-cov-2 detection kit v1",
    "clear labs, inc.__clear dx sars-cov-2 test 09/23/2020",
    "gencurix, inc.__genepro sars-cov-2 test",
    "babson diagnostics, inc.__babson diagnostics ac19g1",
    "the kroger co.__kroger health covid-19 test home collection kit",
    "becton, dickinson and company (bd)__bd veritor system for rapid detection of sars-cov-2",
    "quest diagnostics infectious disease, inc.__quest diagnostics ha sars-cov-2 assay",
    "quest diagnostics infectious disease, inc.__quest diagnostics rc sars-cov-2 assay",
    "quest diagnostics infectious disease, inc.__quest diagnostics pf sars-cov-2 assay",
    "avera institute for human genetics__avera institute for human genetics sars-cov-2 assay",
    "seasun biomaterials, inc.__aq-top covid-19 rapid detection kit plus",
    "viracor eurofins clinical diagnostics__viracor sars-cov-2 assay",
    "ortho clinical diagnostics, inc.__vitros immunodiagnostic products anti-sars-cov-2 total reagent pack",
    "exact sciences laboratories__sars-cov-2 test",
    "mayo clinic laboratories, rochester, mn__sars-cov-2 molecular detection assay",
    "quidel corporation__sofia 2 sars antigen fia",
    "everlywell, inc.__everlywell covid-19 test home collection kit",
    "roche molecular systems, inc.__cobas sars-cov-2 & influenza a/b nucleic acid test for use on the cobas liat system",
    "vela operations singapore pte. ltd.__virokey sars-cov-2 rt-pcr test v2.0 09/22/2020",
    "national jewish health__sars-cov-2 massarray test",
    "biofire diagnostics, llc__biofire respiratory panel 2.1-ez (rp2.1-ez)",

    "roche diagnostics__elecsys anti-sars-cov-2",
    "roche diagnostics__elecsys il-6",
    "siemens healthcare diagnostics inc.__advia centaur sars-cov-2 total (cov2t)",
    "siemens healthcare diagnostics inc.__atellica im sars-cov-2 total (cov2t)",

    # + bulk processed on ig[gm]|immunoasssay|antibody, so there may be errors
    "cellex inc.__qsars-cov-2 igg/igm rapid test",
    "mount sinai laboratory__covid-19 elisa igg antibody test",
    "diasorin inc.__liaison sars-cov-2 s1/s2 igg",
    "ortho-clinical diagnostics, inc.__vitros immunodiagnostic products anti-sars-cov-2 igg reagent",
    "abbott laboratories inc.__sars-cov-2 igg assay",
    "wadsworth center, new york state department of health__new york sars-cov microsphere immunoassay for antibody detection",
    "euroimmun us inc.__anti-sars-cov-2 elisa (igg)",
    "healgen scientific llc__covid-19 igg/igm rapid test cassette (whole blood/serum/plasma)",
    "hangzhou biotest biotech co., ltd.__rightsign covid-19 igg/igm rapid test cassette",
    "siemens healthcare diagnostics inc.__dimension exl sars-cov-2 total antibody assay (cv2t)",
    "siemens healthcare diagnostics inc.__dimension vista sars-cov-2 total antibody assay (cov2t)",
    "inbios international, inc.__scov-2 detect igg elisa",
    "emory medical laboratories__sars-cov-2 rbd igg test",
    "biohit healthcare (hefei) co. ltd.__biohit sars-cov-2 igm/igg antibody test kit",
    "hangzhou laihe biotech co., ltd.__lyher novel coronavirus (2019-ncov) igm/igg antibody combo test kit (colloidal gold)",
    "beckman coulter, inc.__access sars-cov-2 igg",
    "inbios international, inc.__scov-2 detect igm elisa",
    "assure tech. (hangzhou co., ltd)__assure covid-19 igg/igm rapid test device",
    "diazyme laboratories, inc.__diazyme dz-lite sars-cov-2 igg clia kit",
    "salofa oy__sienna-clarity coviblock covid-19 igg/igm rapid test cassette",
    "luminex corporation__xmap sars-cov-2 multi-antigen igg assay",
    "megna health, inc.__rapid covid-19 igm/igg combo test kit",
    "xiamen biotime biotechnology co., ltd.__biotime sars-cov-2 igg/igm rapid qualitative test",
    "access bio, inc.__carestart covid-19 igm/igg",
    "siemens healthcare diagnostics inc.__atellica im sars-cov-2 igg (cov2g)",
    "siemens healthcare diagnostics inc.__advia centaur sars-cov-2 igg (cov2g)",
    "biomérieux sa__vidas sars-cov-2 igg",
    "biomérieux sa__vidas sars-cov-2 igm",
    "biocheck, inc.__biocheck sars-cov-2 igg and igm combo test",
    "diazyme laboratories, inc.__diazyme dz-lite sars-cov-2 igm clia kit",
    "biocan diagnostics inc.__tell me fast novel coronavirus (covid-19) igg/igm antibody test",
    "university of arizona genetics core for clinical services__covid-19 elisa pan-ig antibody test",
    "tbg biotechnology corp.__tbg sars-cov-2 igg / igm rapid test kit",
    "sugentech, inc.__sgti-flex covid-19 igg",
    "biocheck, inc.__biocheck sars-cov-2 igm antibody test kit",
    "biocheck, inc.__biocheck sars-cov-2 igg antibody test kit",
    "shenzhen new industries biomedical engineering co., ltd.__maglumi 2019-ncov igm/igg",
    "jiangsu well biotech co., ltd.__orawell igm/igg rapid test 09/23/2020",
    "bio-rad laboratories__platelia sars-cov-2 total ab assay",
    "vibrant america clinical labs__vibrant covid-19 ab assay",
    "beijing wantai biological pharmacy enterprise co., ltd.__wantai sars-cov-2 ab rapid test",
    # - bulk processed on ig[gm]|immunoasssay|ab |antibody, so there may be errors
])


def get_merged_data ():
    fda_eua_parsed_data = get_fda_eua_parsed_data()
    fda_eua_parsed_data = fda_eua_parsed_data[1:]

    annotation_files_by_test_id = get_annotation_files_by_test_id(fda_eua_parsed_data)

    fda_reference_panel_lod_data_by_test_id = get_fda_reference_panel_lod_data_by_test_id()

    merged_rows = []

    count_missing_fda_reference_panel_lod = 0

    for fda_eua_row in fda_eua_parsed_data:
        test_id = fda_eua_row[0]
        first_issued_date = fda_eua_row[1]
        developer_name = fda_eua_row[3]
        test_name = fda_eua_row[4]
        test_technology = fda_eua_row[6]
        EUAs = fda_eua_row[10]
        url_to_IFU_or_EUA = EUAs[0] if EUAs else fda_eua_row[11]

        if test_id in fda_reference_panel_lod_data_by_test_id:
            fda_reference_panel_lod_data = fda_reference_panel_lod_data_by_test_id[test_id]

            d_name = fda_reference_panel_lod_data["developer_name"]
            different_developer_name = d_name if d_name != developer_name else False
            t_name = fda_reference_panel_lod_data["test_name"]
            different_test_name = t_name if t_name != test_name else False

        else:
            if True and test_id not in temporary_test_ids_not_in_fda_reference_panel_lod_data:
                print("Error: test_id from EUA data not found in FDA reference panel data: \"{}\"".format(test_id))
                count_missing_fda_reference_panel_lod += 1

            different_developer_name = False
            different_test_name = False
            fda_reference_panel_lod_data = {
                "results_status": "",
                "lod": "",
                "sample_media_type": "",
            }

        annotation_files_for_test = annotation_files_by_test_id[test_id]
        annotations_by_label_id = get_annotations_by_label_id(annotation_files_for_test)
        lod_value = get_lod_value(annotations_by_label_id)
        lod_units = get_lod_units(annotations_by_label_id)
        synthetic_specimen__viral_material = get_synthetic_specimen__viral_material(annotations_by_label_id)

        row = {
            "test_id": test_id,
            "FDA_EUAs_list": {
                "first_issued_date": first_issued_date,
                "developer_name": developer_name,
                "test_name": test_name,
                "test_technology": test_technology,
                "url_to_IFU_or_EUA": url_to_IFU_or_EUA,
            },
            "fda_reference_panel_lod_data": {
                "different_developer_name": different_developer_name,
                "different_test_name": different_test_name,
                "results_status": fda_reference_panel_lod_data["results_status"],
                "lod": fda_reference_panel_lod_data["lod"],
                "sample_media_type": fda_reference_panel_lod_data["sample_media_type"],
            },
            "self_declared_EUA_data": {
                "lod_min": lod_value["data"]["min"],
                "lod_max": lod_value["data"]["max"],
                "lod_units": lod_units["data"]["value"],
                "synthetic_specimen__viral_material": synthetic_specimen__viral_material["data"]["types"],
            },
        }

        merged_rows.append(row)

    if count_missing_fda_reference_panel_lod:
        print("Warning:  {} missing FDA reference panel lod data".format(count_missing_fda_reference_panel_lod))

    return merged_rows


def store_data(data):
    with open(DATA_FILE_PATH_merged_data, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


merged_rows = get_merged_data()
store_data(merged_rows)
