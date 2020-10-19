var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _a;
function is_annotation(annotation) {
    return !annotation.deleted;
}
var labels = {
    claims__controls__internal__human_gene_target: 83,
    claims__limit_of_detection__minimum_replicates: 68,
    claims__limit_of_detection__value: 66,
    claims__limit_of_detection__units: 67,
    claims__primers_and_probes__sequences: 78,
    claims__primers_and_probes__sources: 79,
    claims__reaction_volume_uL: 72,
    claims__specimen__supported_types: 0,
    claims__specimen__transport_medium: 34,
    claims__target_viral_genes: 6,
    meta__error: 74,
    meta__not_specified: 73,
    meta__not_specified__partial_info: 109,
    meta__potential_error: 99,
    metrics__confusion_matrix__false_negatives: 42,
    metrics__confusion_matrix__false_positives: 44,
    metrics__confusion_matrix__true_negatives: 43,
    metrics__confusion_matrix__true_positives: 41,
    metrics__num_clinical_samples__negative_controls: -1,
    metrics__num_clinical_samples__positive: -1,
    synthetic_specimen_virus_type_Naked_RNA: 112,
    synthetic_specimen_virus_type_Antigens: 113,
    synthetic_specimen_virus_type_Synthetic_Viral_Particles: 114,
    synthetic_specimen_virus_type_Inactivated_Virus__Heat: 115,
    synthetic_specimen_virus_type_Inactivated_Virus__Gammma: 116,
    synthetic_specimen_virus_type_Inactivated_Virus__Chemical: 117,
    synthetic_specimen_virus_type_Live_Virus: 118,
    synthetic_specimen_virus_type_Inactivated_Virus__method_not_specified: 119,
    synthetic_specimen_virus_type_Partial_Live_Virus: 120,
    test_descriptor__manufacturer_name: 111,
    test_descriptor__test_name: 110,
    test_technology: 7,
    validation_condition__author: 24,
    validation_condition__comparator_test: -1,
    validation_condition__date: 25,
    validation_condition__sample_volume: -1,
    validation_condition__specimen_type: -1,
    validation_condition__swab_type: -1,
    validation_condition__synthetic_specimen__clinical_matrix: 64,
    validation_condition__synthetic_specimen__clinical_matrix_source: 86,
    validation_condition__synthetic_specimen__viral_material: 62,
    validation_condition__synthetic_specimen__viral_material_source: 63,
    validation_condition__transport_medium: -1,
    // This smells and suggests we should have kept the second layer of data_keys in conjunction with labels
    _extra_url_to_IFU_or_EUA: -2
};
var LABEL_IDS__META__NOT_SPECIFIED = [
    labels.meta__not_specified,
    labels.meta__not_specified__partial_info,
];
var LABEL_IDS__META__ERRORS = [
    labels.meta__error,
    labels.meta__potential_error,
];
var LABEL_IDS__META = __spreadArrays(LABEL_IDS__META__NOT_SPECIFIED, LABEL_IDS__META__ERRORS);
function get_used_annotation_label_ids(annotation_files_by_test_id) {
    var used_annotation_label_ids = new Set();
    Object.values(annotation_files_by_test_id)
        .forEach(function (annotation_files) {
        annotation_files.forEach(function (annotation_file) {
            annotation_file.annotations
                .filter(is_annotation)
                .forEach(function (annotation) {
                annotation.labels.forEach(function (label) {
                    used_annotation_label_ids.add(label.id);
                });
            });
        });
    });
    return used_annotation_label_ids;
}
// Report on unused labels
function report_on_unused_labels(label_ids_to_names, used_annotation_label_ids) {
    var HANDLED_LABEL_IDS = new Set(Object.values(labels));
    var LABEL_IDS_HANDLED_ELSE_WHERE = LABEL_IDS__META;
    LABEL_IDS_HANDLED_ELSE_WHERE.forEach(function (label_id) { return HANDLED_LABEL_IDS.add(label_id); });
    var LABEL_IDS_TO_SILENCE = [
        70,
        71,
        84,
        85,
        // 86, // -> Specimen/Synthetic Specimen/Clinical matrix/Source,
        87,
        88,
        75,
        89,
        90,
        96,
        98,
        97,
        100,
        82,
        101,
        102,
        105,
        103,
        104,
        35,
        56,
        13,
        11,
        33,
        107,
        106,
        16,
        108,
        5,
        60,
    ];
    LABEL_IDS_TO_SILENCE.forEach(function (label_id) { return HANDLED_LABEL_IDS.add(label_id); });
    var unhandled_label_ids = used_annotation_label_ids.filter(function (x) { return !HANDLED_LABEL_IDS.has(x); });
    if (unhandled_label_ids.length) {
        console.log("Unhandled label ids: " + unhandled_label_ids.map(function (id) { return "\n * " + id + " -> " + label_ids_to_names[id]; }));
    }
}
function reformat_fda_eua_parsed_data_as_rows(fda_eua_parsed_data) {
    return fda_eua_parsed_data
        .slice(1) // skip first row of json array which contains csv-like array of headers
        .map(function (fda_eua_parsed_data_row) {
        var _a;
        var test_id = fda_eua_parsed_data_row[0];
        var date = fda_eua_parsed_data_row[1];
        var manufacturer_name = fda_eua_parsed_data_row[3];
        var test_name = fda_eua_parsed_data_row[4];
        var test_technology = fda_eua_parsed_data_row[6];
        var EUAs = fda_eua_parsed_data_row[10];
        var url_to_IFU_or_EUA = EUAs.length ? EUAs[0] : fda_eua_parsed_data_row[11];
        var row = (_a = {
                test_id: test_id
            },
            _a[labels.validation_condition__date] = {
                annotations: [],
                data: { value: date }
            },
            _a[labels.test_descriptor__test_name] = {
                annotations: [],
                data: { value: test_name }
            },
            _a[labels.test_descriptor__manufacturer_name] = {
                annotations: [],
                data: { value: manufacturer_name }
            },
            _a[labels.test_technology] = {
                annotations: [],
                data: { value: test_technology }
            },
            _a[labels.validation_condition__author] = {
                annotations: [],
                data: { value: "self" }
            },
            _a[labels._extra_url_to_IFU_or_EUA] = {
                annotations: [],
                data: { value: url_to_IFU_or_EUA }
            },
            _a);
        return row;
    });
}
function add_data_from_annotations(row, annotation_files_by_test_id, labels) {
    var test_id = row.test_id;
    var annotation_files = annotation_files_by_test_id[test_id];
    if (!annotation_files)
        return;
    Object.values(labels).forEach(function (label_id) {
        if (row[label_id])
            return; // hack to avoid overwriting fields already set from parse FDA EUA data
        var annotations = filter_annotation_files_for_label(annotation_files, label_id);
        row[label_id] = { annotations: annotations, refs: annotations.map(ref_link) };
    });
}
function filter_annotation_files_for_label(annotation_files, label_id) {
    var annotations = [];
    annotation_files.forEach(function (annotation_file) {
        annotations = __spreadArrays(annotations, filter_annotations_for_label(annotation_file, label_id));
    });
    return annotations;
}
function filter_annotations_for_label(annotation_file, label_id) {
    return annotation_file.annotations
        .filter(is_annotation)
        .filter(function (annotation) {
        return annotation.labels.filter(function (label) { return label.id === label_id; }).length;
    })
        .map(function (annotation) {
        return (__assign(__assign({}, annotation), { relative_file_path: annotation_file.relative_file_path }));
    });
}
// const extracted_data: DATA = [
//     {
//         [DATA_KEYS.test_descriptor__manufacturer_name]: { value: "", refs: [] },
//         [DATA_KEYS.test_descriptor__test_name]: { value: "ePlex SARS-CoV-2 Test", refs: [] },
//         [DATA_KEYS.validation_condition__author]: { value: "self", refs: [] },
//         [DATA_KEYS.validation_condition__date]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__specimen_type]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__swab_type]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__transport_medium]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__sample_volume]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__comparator_test]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__num_clinical_samples__positive]: {
//             value: 18,
//             refs: [
//                 "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2FFDA-EUA%2FPDFs%2F136282.pdf&highlighted_annotation_ids=8"
//             ]
//         },
//         [DATA_KEYS.metrics__num_clinical_samples__negative_controls]: {
//             value: 47,
//             refs: [
//                 "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2FFDA-EUA%2FPDFs%2F136282.pdf&highlighted_annotation_ids=9"
//             ]
//         },
//         [DATA_KEYS.metrics__confusion_matrix__true_positives]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__confusion_matrix__false_negatives]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__confusion_matrix__true_negatives]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__confusion_matrix__false_positives]: { value: "", refs: [] },
//     },
//     {
//         [DATA_KEYS.test_descriptor__manufacturer_name]: { value: "", refs: [] },
//         [DATA_KEYS.test_descriptor__test_name]: { value: "ePlex SARS-CoV-2 Test", refs: [] },
//         [DATA_KEYS.validation_condition__author]: { value: "Uhteg, et al.", refs: ["https://doi.org/10.1016/j.jcv.2020.104384"] },
//         [DATA_KEYS.validation_condition__date]: { value: "2020-04-16", refs: [] },
//         [DATA_KEYS.validation_condition__specimen_type]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__swab_type]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__transport_medium]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__sample_volume]: { value: "", refs: [] },
//         [DATA_KEYS.validation_condition__comparator_test]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__num_clinical_samples__positive]: {
//             value: 13,
//             refs: [
//                 "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FUhteg_2020____comparison_of_3_SARS-2_diagnostics.pdf&highlighted_annotation_ids=5"
//             ]
//         },
//         [DATA_KEYS.metrics__num_clinical_samples__negative_controls]: {
//             value: 34,
//             refs: [
//                 "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FUhteg_2020____comparison_of_3_SARS-2_diagnostics.pdf&highlighted_annotation_ids=6"
//             ]
//         },
//         [DATA_KEYS.metrics__confusion_matrix__true_positives]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__confusion_matrix__false_negatives]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__confusion_matrix__true_negatives]: { value: "", refs: [] },
//         [DATA_KEYS.metrics__confusion_matrix__false_positives]: { value: "", refs: [] },
//     },
//     {
//         [DATA_KEYS.test_descriptor__manufacturer_name]: { value: "", refs: [] },
//         [DATA_KEYS.test_descriptor__test_name]: { value: "ePlex SARS-CoV-2 Test", refs: [] },
//         [DATA_KEYS.validation_condition__author]: { value: "PHE", refs: ["https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/897832/Rapid_Assessment_of_GenMark_ePlex_SARS_CoV_2_test_V1.00e.pdf"] },
//         [DATA_KEYS.validation_condition__date]: { value: "2020-07-08", refs: [] },
//         [DATA_KEYS.validation_condition__specimen_type]: {
//             value: "NP?",
//             comment: "It should be NP specimens but clinical specimen type not stated",
//             refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=3"
//         ] },
//         [DATA_KEYS.validation_condition__swab_type]: { value: "_?_", refs: [] },
//         [DATA_KEYS.validation_condition__transport_medium]: {
//             value: "VTM _?_",
//             comment: "Unknown brand or formulation of VTM",
//             refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=4"
//         ] },
//         [DATA_KEYS.validation_condition__sample_volume]: { value: "200 ul", refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=5"
//         ] },
//         [DATA_KEYS.validation_condition__comparator_test]: { value: "in-house PHE PCR assay", refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=2"
//         ] },
//         [DATA_KEYS.metrics__num_clinical_samples__positive]: {
//             value: 93,
//             refs: [
//                 "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=0"
//             ]
//         },
//         [DATA_KEYS.metrics__num_clinical_samples__negative_controls]: {
//             value: 120,
//             refs: [
//                 "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=1"
//             ]
//         },
//         [DATA_KEYS.metrics__confusion_matrix__true_positives]: { value: 101, refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=10"
//         ] },
//         [DATA_KEYS.metrics__confusion_matrix__false_negatives]: { value: 1, refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=11"
//         ] },
//         [DATA_KEYS.metrics__confusion_matrix__true_negatives]: { value: 124, refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=12"
//         ] },
//         [DATA_KEYS.metrics__confusion_matrix__false_positives]: { value: 2, refs: [
//             "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2Fpapers%2FPHE_2020____GenMark_ePlex_assessment.pdf&highlighted_annotation_ids=13"
//         ] },
//     },
//     // {
//     //     [DATA_KEYS.test_descriptor__manufacturer_name]: { value: "", refs: [] },
//     //     [DATA_KEYS.test_descriptor__test_name]: { value: "", refs: [] },
//     //     [DATA_KEYS.validation_condition__author]: { value: "", refs: [] },
//     //     [DATA_KEYS.validation_condition__date]: { value: "", refs: [] },
//     //     [DATA_KEYS.validation_condition__specimen_type]: { value: "", refs: [] },
//     //     [DATA_KEYS.validation_condition__swab_type]: { value: "", refs: [] },
//     //     [DATA_KEYS.validation_condition__transport_medium]: { value: "", refs: [] },
//     //     [DATA_KEYS.validation_condition__sample_volume]: { value: "", refs: [] },
//     //     [DATA_KEYS.validation_condition__comparator_test]: { value: "", refs: [] },
//     //     [DATA_KEYS.metrics__num_clinical_samples__positive]: {
//     //         value: 0,
//     //         refs: [
//     //             ""
//     //         ]
//     //     },
//     //     [DATA_KEYS.metrics__num_clinical_samples__negative_controls]: {
//     //         value: 0,
//     //         refs: [
//     //             ""
//     //         ]
//     //     },
//     //     [DATA_KEYS.metrics__confusion_matrix__true_positives]: { value: "", refs: [] },
//     //     [DATA_KEYS.metrics__confusion_matrix__false_negatives]: { value: "", refs: [] },
//     //     [DATA_KEYS.metrics__confusion_matrix__true_negatives]: { value: "", refs: [] },
//     //     [DATA_KEYS.metrics__confusion_matrix__false_positives]: { value: "", refs: [] },
//     // },
// ]
function activate_options() {
    var cells_expanded = false;
    document.getElementById("toggle_expanded_cells").onclick = function () {
        cells_expanded = !cells_expanded;
        var cells = Array.from(document.getElementsByClassName("value_el"));
        if (cells_expanded) {
            cells.forEach(function (cell) { return cell.classList.add("expanded"); });
        }
        else {
            cells.forEach(function (cell) { return cell.classList.remove("expanded"); });
        }
    };
}
var headers = [
    {
        title: "Manufacturer",
        label_id: null,
        category: "test_descriptor",
        children: [
            {
                title: "Name",
                label_id: labels.test_descriptor__manufacturer_name
            },
            {
                title: "Test name",
                label_id: labels.test_descriptor__test_name
            },
            {
                title: "IFU or EUA",
                label_id: labels._extra_url_to_IFU_or_EUA
            }
        ]
    },
    {
        title: "Claims",
        label_id: null,
        category: "test_claims",
        children: [
            {
                title: "Test technology",
                label_id: labels.test_technology
            },
            {
                title: "Specimens",
                label_id: null,
                children: [
                    {
                        title: "Supported specimen types",
                        label_id: labels.claims__specimen__supported_types
                    },
                    {
                        title: "Transport medium",
                        label_id: labels.claims__specimen__transport_medium
                    },
                ]
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Appropriate testing population",
                // e.g. * patients suspected of COVID-19 by a healthcare provider
                //      * pooled samples
                //      * general, asymptomatic screening population i.e. screening of individuals without symptoms or other reasons to suspect COVID-19
                label_id: null
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Sample pooling",
                label_id: null,
                children: [
                    { title: "Approach", label_id: null },
                    { title: "Max no. specimens", label_id: null },
                ]
            },
            { title: "Target gene(s) of SARS-CoV-2", label_id: labels.claims__target_viral_genes },
            {
                title: "Primers and probes",
                label_id: null,
                children: [
                    { title: "Sequences", label_id: labels.claims__primers_and_probes__sequences },
                    { title: "Sources", label_id: labels.claims__primers_and_probes__sources },
                ]
            },
            {
                // Not in May 13th version of FDA EUA template
                // i.e. can include more than just SARS-CoV-2
                title: "Detects pathogen(s)",
                label_id: null
            },
            {
                title: "Limit of Detection (LOD)",
                label_id: null,
                children: [
                    {
                        title: "value",
                        label_id: labels.claims__limit_of_detection__value
                    },
                    {
                        title: "units",
                        label_id: labels.claims__limit_of_detection__units
                    },
                    {
                        title: "Minimum replicates",
                        label_id: labels.claims__limit_of_detection__minimum_replicates
                    },
                ]
            },
            {
                title: "Intended user",
                // e.g. CLIA labs
                label_id: null
            },
            { title: "Compatible equipment", label_id: null },
            // {
            // Product Overview/Test Principle...
            //     // primer and probe sets and briefly describe what they detect. Please include the nucleic acid sequences for all primers and probes used in the test. Please indicate if the test uses biotin-Streptavidin/avidin chemistry
            // },
            {
                title: "Controls",
                label_id: null,
                children: [
                    { title: "Human gene", label_id: labels.claims__controls__internal__human_gene_target },
                ]
            },
            {
                title: "RNA extraction",
                label_id: null,
                children: [
                    { title: "Specimen input volume", label_id: null },
                    { title: "RNA extraction method(s)", label_id: null },
                    { title: "Nucleic acid elution volume", label_id: null },
                    { title: "Purification manual &/ automated", label_id: null },
                ]
            },
            {
                title: "Reverse transcription",
                label_id: null,
                children: [
                    { title: "Input volume", label_id: null },
                    { title: "Enzyme mix / kits", label_id: null },
                ]
            },
            {
                title: "PCR / amplification",
                label_id: null,
                children: [
                    { title: "Instrument", label_id: null },
                    { title: "Enzyme mix / kits", label_id: null },
                    { title: "Reaction volume / μL", label_id: labels.claims__reaction_volume_uL },
                ]
            },
            {
                title: "PCR quantification fluoresence detection",
                label_id: null,
                children: [
                    { title: "Instrument", label_id: null },
                ]
            },
        ]
    },
    {
        title: "Validation conditions",
        label_id: null,
        category: "validation_condition",
        children: [
            {
                title: "Author",
                label_id: labels.validation_condition__author
            },
            {
                title: "Date",
                label_id: labels.validation_condition__date
            },
            {
                title: "Patient details",
                label_id: null,
                children: [
                    { title: "Age", label_id: null },
                    { title: "Race", label_id: null },
                    { title: "Gender", label_id: null },
                ]
            },
            { title: "Disease stage", label_id: null },
            {
                title: "Synthetic Specimen",
                label_id: null,
                children: [
                    { title: "Viral material", label_id: labels.validation_condition__synthetic_specimen__viral_material },
                    { title: "Viral material source", label_id: labels.validation_condition__synthetic_specimen__viral_material_source },
                    { title: "Clinical matrix", label_id: labels.validation_condition__synthetic_specimen__clinical_matrix },
                    { title: "Clinical matrix source", label_id: labels.validation_condition__synthetic_specimen__clinical_matrix_source },
                ]
            },
            {
                title: "Specimen",
                label_id: null,
                children: [
                    { title: "Type", label_id: labels.validation_condition__specimen_type },
                    { title: "Swab type", label_id: labels.validation_condition__swab_type },
                    { title: "Transport medium", label_id: labels.validation_condition__transport_medium },
                    { title: "Sample volume", label_id: labels.validation_condition__sample_volume },
                ]
            },
        ]
    },
    {
        title: "Overall score",
        label_id: null,
        category: "metric"
    },
    {
        title: "Metrics",
        label_id: null,
        category: "metric",
        children: [
            {
                title: "Number of clinical samples",
                label_id: null,
                children: [
                    {
                        title: "Positives",
                        label_id: labels.metrics__num_clinical_samples__positive
                    },
                    {
                        title: "Controls (negatives)",
                        label_id: labels.metrics__num_clinical_samples__negative_controls
                    },
                ]
            },
            {
                title: "Comparator test",
                label_id: labels.validation_condition__comparator_test
            },
            {
                title: "Confusion matrix",
                label_id: null,
                children: [
                    { title: "True positives", label_id: labels.metrics__confusion_matrix__true_positives },
                    { title: "False negatives", label_id: labels.metrics__confusion_matrix__false_negatives },
                    { title: "True negatives", label_id: labels.metrics__confusion_matrix__true_negatives },
                    { title: "False positives", label_id: labels.metrics__confusion_matrix__false_positives },
                ]
            },
        ]
    },
    {
        title: "Derived values",
        label_id: null,
        category: "derived_values",
        children: []
    },
];
function build_header(headers) {
    var table_el = document.getElementById("data_table");
    var thead_el = table_el.getElementsByTagName("thead")[0];
    var row1 = thead_el.insertRow();
    var row2 = thead_el.insertRow();
    var row3 = thead_el.insertRow();
    for (var i1 = 0; i1 < headers.length; ++i1) {
        var element1 = headers[i1];
        var className = element1.category + " header_label";
        var row1_width = 0;
        var row1_height = 1;
        if (!(element1.children && element1.children.length)) {
            row1_width = 1;
            row1_height = 3;
        }
        else
            for (var i2 = 0; i2 < element1.children.length; ++i2) {
                var element2 = element1.children[i2];
                var row2_width = 0;
                var row2_height = 1;
                if (!(element2.children && element2.children.length)) {
                    row2_width = 1;
                    row2_height = 2;
                }
                else
                    for (var i3 = 0; i3 < element2.children.length; ++i3) {
                        var element3 = element2.children[i3];
                        row2_width++;
                        var cell3 = document.createElement("th");
                        row3.appendChild(cell3);
                        cell3.innerHTML = element3.title;
                        cell3.className = className;
                    }
                var cell2 = document.createElement("th");
                row2.appendChild(cell2);
                cell2.innerHTML = element2.title;
                cell2.colSpan = row2_width;
                cell2.rowSpan = row2_height;
                cell2.className = className;
                row1_width += row2_width;
            }
        var cell1 = document.createElement("th");
        row1.appendChild(cell1);
        cell1.innerHTML = element1.title;
        cell1.colSpan = row1_width;
        cell1.rowSpan = row1_height;
        cell1.className = className;
    }
}
function iterate_lowest_header(headers, func) {
    for (var i1 = 0; i1 < headers.length; ++i1) {
        var element1 = headers[i1];
        if (!(element1.children && element1.children.length)) {
            func(element1);
        }
        else
            for (var i2 = 0; i2 < element1.children.length; ++i2) {
                var element2 = element1.children[i2];
                if (!(element2.children && element2.children.length)) {
                    func(element2);
                }
                else
                    for (var i3 = 0; i3 < element2.children.length; ++i3) {
                        var element3 = element2.children[i3];
                        func(element3);
                    }
            }
    }
}
function has_only_subset_of_labels(labels, allowed_subset_ids) {
    var allowed = new Set(allowed_subset_ids);
    return labels.filter(function (label) { return !allowed.has(label.id); }).length === 0;
}
function data_value_handler(data_node) {
    var value = (data_node.data || {}).value;
    if (value === undefined)
        console.warn("No .data.value present in: ", data_node);
    value = value || "";
    return { string: value, refs: data_node.refs || [], data: { value: value } };
}
function annotations_value_handler(data_node) {
    var annotations = data_node.annotations;
    var value = "";
    var string = "";
    if (annotations.length > 0) {
        value = value_from_annotations(annotations);
        var comments = comments_from_annotations(annotations);
        string = value + "<br/>" + comments;
    }
    return { string: string, refs: data_node.refs || [], data: { value: value } };
}
var WARNING_HTML_SYMBOL = "<span class=\"warning_symbol\" title=\"Value not specified\">\u26A0</span>";
var ERROR_HTML_SYMBOL = "<span class=\"error_symbol\" title=\"Potential error\">\u26A0</span>";
function not_specified_value_html(value) {
    var append_text = value ? value + " (not specified)" : "Not specified";
    return WARNING_HTML_SYMBOL + " " + append_text;
}
function value_from_annotations(annotations) {
    var includes_warning = false;
    var includes_error = false;
    var value = annotations.map(function (annotation) {
        var value = annotation.text;
        if (annotation.labels.find(function (label) { return LABEL_IDS__META__NOT_SPECIFIED.includes(label.id); })) {
            includes_warning = true;
            value = not_specified_value_html(value);
        }
        if (annotation.labels.find(function (label) { return LABEL_IDS__META__ERRORS.includes(label.id); })) {
            includes_error = true;
            value = ERROR_HTML_SYMBOL + " " + value;
        }
        return value;
    }).join(", ");
    if (includes_warning && !value.startsWith(WARNING_HTML_SYMBOL)) {
        value = WARNING_HTML_SYMBOL + " " + value;
    }
    if (includes_error && !value.startsWith(ERROR_HTML_SYMBOL)) {
        value = ERROR_HTML_SYMBOL + " " + value;
    }
    return value;
}
function comments_from_annotations(annotations) {
    var comments = "";
    annotations.forEach(function (annotation) {
        if (annotation.comment) {
            comments += "<span title=\"" + html_safe_ish(annotation.comment) + "\">C</span> ";
        }
    });
    return comments;
}
function ref_link(annotation) {
    var relative_file_path = annotation.relative_file_path, id = annotation.id;
    var ref = "http://localhost:5003/r/1772.2/-1?relative_file_path=" + relative_file_path;
    if (id !== undefined)
        ref += "&highlighted_annotation_ids=" + id;
    return ref;
}
var lod_allowed_label_ids = __spreadArrays([labels.claims__limit_of_detection__value], LABEL_IDS__META);
function lod_value_handler(data_node) {
    var min = Number.MAX_SAFE_INTEGER;
    var max = Number.MIN_SAFE_INTEGER;
    var min_annotation;
    var max_annotation;
    data_node.annotations
        .forEach(function (annotation) {
        if (has_only_subset_of_labels(annotation.labels, lod_allowed_label_ids)) {
            var v = parseFloat(annotation.text);
            var new_min = Math.min(min, v);
            var new_max = Math.max(max, v);
            if (new_min !== min) {
                min = new_min;
                min_annotation = annotation;
            }
            if (new_max !== max) {
                max = new_max;
                max_annotation = annotation;
            }
        }
    });
    if (!min_annotation) {
        return {
            string: "",
            refs: [],
            data: { not_specified: true }
        };
    }
    var same = min === max;
    var comments = same ? comments_from_annotations([min_annotation]) : comments_from_annotations([min_annotation, max_annotation]);
    var string = (same ? "" + min : min + " <-> " + max) + "<br/>" + comments;
    var refs = same ? [ref_link(min_annotation)] : [ref_link(min_annotation), ref_link(max_annotation)];
    return { string: string, refs: refs, data: { min: min, max: max } };
}
var virus_type_label_ids = new Set([
    labels.synthetic_specimen_virus_type_Naked_RNA,
    labels.synthetic_specimen_virus_type_Antigens,
    labels.synthetic_specimen_virus_type_Synthetic_Viral_Particles,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__Heat,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__Gammma,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__Chemical,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__method_not_specified,
    labels.synthetic_specimen_virus_type_Live_Virus,
    labels.synthetic_specimen_virus_type_Partial_Live_Virus,
]);
function synthetic_specimen__viral_material_value_handler(data_node) {
    var annotations = data_node.annotations;
    var v = annotations.map(function (a) { return a.text; }).join("; ");
    var string = "";
    var types = [];
    if (annotations.length) {
        annotations.forEach(function (a) { return a.labels.forEach(function (_a) {
            var id = _a.id;
            if (virus_type_label_ids.has(id)) {
                var parts = label_ids_to_names[id].split("/");
                types.push(parts[parts.length - 1]);
            }
        }); });
        var type = types.length ? types.join(", ") : "<span style=\"color: #ccc;\">not parsed</span>";
        string = type + " | " + v;
    }
    return { string: string, refs: data_node.refs, data: { types: types } };
}
function link_value_handler(data_node) {
    var url = data_node.data.value;
    var pseudo_annotation = {
        relative_file_path: get_FDA_EUA_pdf_file_path_from_url(url)
    };
    var refs = [ref_link(pseudo_annotation)];
    return { string: "", refs: refs, data: { value: url } };
}
/** TypeScript version of python function */
function get_FDA_EUA_pdf_file_path_from_url(url) {
    var matches = url.match("https://www.fda.gov/media/(\\d+)/download");
    var file_id = "";
    try {
        file_id = matches[1];
    }
    catch (e) {
        console.error("failed on url: ", url);
        throw e;
    }
    var file_path = "FDA-EUA/PDFs/" + file_id + ".pdf";
    return file_path;
}
var value_handlers = (_a = {},
    _a[labels.claims__limit_of_detection__value] = lod_value_handler,
    _a[labels.test_descriptor__manufacturer_name] = data_value_handler,
    _a[labels.test_descriptor__test_name] = data_value_handler,
    _a[labels.test_technology] = data_value_handler,
    _a[labels.validation_condition__author] = data_value_handler,
    _a[labels.validation_condition__date] = data_value_handler,
    _a[labels.validation_condition__synthetic_specimen__viral_material] = synthetic_specimen__viral_material_value_handler,
    _a[labels._extra_url_to_IFU_or_EUA] = link_value_handler,
    _a);
function create_table_cell_contents(data_node) {
    var value_title = html_safe_ish(data_node.html_display_string);
    var value_el = document.createElement("div");
    value_el.className = "value_el";
    value_el.innerHTML = data_node.html_display_string;
    value_el.title = value_title;
    value_el.addEventListener("click", function () {
        value_el.classList.toggle("expanded");
    });
    var ref_container_el = document.createElement("div");
    ref_container_el.innerHTML = data_node.refs.map(function (r) { return " <a class=\"reference\" href=\"" + r + "\">R</a>"; }).join(" ");
    return [value_el, ref_container_el];
}
function populate_table_body(headers, data_rows) {
    var table_el = document.getElementById("data_table");
    var tbody_el = table_el.getElementsByTagName("tbody")[0];
    data_rows.forEach(function (data_row) {
        var row = tbody_el.insertRow();
        iterate_lowest_header(headers, function (header) {
            var cell = row.insertCell();
            var data_node = data_row[header.label_id];
            if (data_node) {
                var value_handler = value_handlers[header.label_id] || annotations_value_handler;
                var value = value_handler(data_node);
                data_node.html_display_string = value.string;
                data_node.refs = value.refs;
                data_node.data = value.data;
                var children = create_table_cell_contents(data_node);
                children.forEach(function (child_el) { return cell.appendChild(child_el); });
            }
        });
    });
    var data_for_export = [];
    data_rows.forEach(function (data_row) {
        var lod = (data_row[labels.claims__limit_of_detection__value] || {}).data || {};
        var lod_units = ((data_row[labels.claims__limit_of_detection__units] || {}).data || {});
        var synthetic_specimen__viral_material = (data_row[labels.validation_condition__synthetic_specimen__viral_material] || {}).data || {};
        data_for_export.push({
            test_id: data_row.test_id,
            developer_name: data_row[labels.test_descriptor__manufacturer_name].data.value,
            test_name: data_row[labels.test_descriptor__test_name].data.value,
            lod_min: lod.min,
            lod_max: lod.max,
            lod_units: lod_units.value,
            synthetic_specimen__viral_material: synthetic_specimen__viral_material.types
        });
    });
    console.log(JSON.stringify(data_for_export, null, 2));
}
function update_progress() {
    var progress_el = document.getElementById("progress");
    var tbody = document.getElementsByTagName("tbody")[0];
    var total_rows = tbody.children.length;
    var total_valid_rows = 0;
    var total_completed = 0;
    Array.from(tbody.children).forEach(function (row) {
        total_valid_rows += (row.children[3].innerText.includes("Serology") ? 0 : 1);
        total_completed += (row.children[4].innerText !== "" ? 1 : 0);
    });
    var percentage = ((total_completed / total_rows) * 100).toFixed(1);
    progress_el.innerText = percentage + "% " + total_completed + "/" + total_valid_rows + "  (" + total_rows + ")";
}
// DO NOT USE THIS IN PRODUCTION
function html_safe_ish(value) {
    return value.replace(/(<([^>]+)>)/ig, "")
        .replace(/"/ig, "'");
}
activate_options();
var used_annotation_label_ids = Array.from(get_used_annotation_label_ids(annotation_files_by_test_id));
report_on_unused_labels(label_ids_to_names, used_annotation_label_ids);
var data_rows = reformat_fda_eua_parsed_data_as_rows(fda_eua_parsed_data);
data_rows.forEach(function (row) { return add_data_from_annotations(row, annotation_files_by_test_id, labels); });
build_header(headers);
populate_table_body(headers, data_rows);
update_progress();
