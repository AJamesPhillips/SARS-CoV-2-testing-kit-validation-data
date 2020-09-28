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
var DATA_KEYS;
(function (DATA_KEYS) {
    DATA_KEYS["test_descriptor__manufacturer_name"] = "test_descriptor__manufacturer_name";
    DATA_KEYS["test_descriptor__test_name"] = "test_descriptor__test_name";
    DATA_KEYS["claims__controls__internal__human_gene_target"] = "claims__controls__internal__human_gene_target";
    DATA_KEYS["claims__limit_of_detection__minimum_replicates"] = "claims__limit_of_detection__minimum_replicates";
    DATA_KEYS["claims__limit_of_detection__value"] = "claims__limit_of_detection__value";
    DATA_KEYS["claims__limit_of_detection__units"] = "claims__limit_of_detection__units";
    DATA_KEYS["claims__primers_and_probes__sequences"] = "claims__primers_and_probes__sequences";
    DATA_KEYS["claims__primers_and_probes__sources"] = "claims__primers_and_probes__sources";
    DATA_KEYS["claims__reaction_volume_uL"] = "claims__reaction_volume_uL";
    DATA_KEYS["claims__specimen__supported_types"] = "claims__supported_specimen_types";
    DATA_KEYS["claims__specimen__transport_medium"] = "claims__specimen__transport_medium";
    DATA_KEYS["claims__target_viral_genes"] = "claims__target_viral_genes";
    DATA_KEYS["validation_condition__author"] = "validation_condition__author";
    DATA_KEYS["validation_condition__comparator_test"] = "validation_condition__comparator_test";
    DATA_KEYS["validation_condition__date"] = "validation_condition__date";
    DATA_KEYS["validation_condition__sample_volume"] = "validation_condition__sample_volume";
    DATA_KEYS["validation_condition__specimen_type"] = "validation_condition__specimen_type";
    DATA_KEYS["validation_condition__swab_type"] = "validation_condition__swab_type";
    DATA_KEYS["validation_condition__synthetic_specimen__clinical_matrix"] = "validation_condition__synthetic_specimen__clinical_matrix";
    DATA_KEYS["validation_condition__synthetic_specimen__clinical_matrix_source"] = "validation_condition__synthetic_specimen__clinical_matrix_source";
    DATA_KEYS["validation_condition__synthetic_specimen__viral_material"] = "validation_condition__synthetic_specimen__viral_material";
    DATA_KEYS["validation_condition__synthetic_specimen__viral_material_source"] = "validation_condition__synthetic_specimen__viral_material_source";
    DATA_KEYS["validation_condition__transport_medium"] = "validation_condition__transport_medium";
    DATA_KEYS["metrics__num_clinical_samples__positive"] = "metrics__num_clinical_samples__positive";
    DATA_KEYS["metrics__num_clinical_samples__negative_controls"] = "metrics__num_clinical_samples__negative_controls";
    DATA_KEYS["metrics__confusion_matrix__true_positives"] = "metrics__confusion_matrix__true_positives";
    DATA_KEYS["metrics__confusion_matrix__false_negatives"] = "metrics__confusion_matrix__false_negatives";
    DATA_KEYS["metrics__confusion_matrix__true_negatives"] = "metrics__confusion_matrix__true_negatives";
    DATA_KEYS["metrics__confusion_matrix__false_positives"] = "metrics__confusion_matrix__false_positives";
})(DATA_KEYS || (DATA_KEYS = {}));
var MAP_DATA_KEY_TO_LABEL_ID = (_a = {},
    // [DATA_KEYS.test_descriptor__manufacturer_name]: 1,
    // [DATA_KEYS.test_descriptor__test_name]: 1,
    _a[DATA_KEYS.claims__controls__internal__human_gene_target] = 83,
    _a[DATA_KEYS.claims__limit_of_detection__minimum_replicates] = 68,
    _a[DATA_KEYS.claims__limit_of_detection__value] = 66,
    _a[DATA_KEYS.claims__limit_of_detection__units] = 67,
    _a[DATA_KEYS.claims__primers_and_probes__sequences] = 78,
    _a[DATA_KEYS.claims__primers_and_probes__sources] = 79,
    _a[DATA_KEYS.claims__reaction_volume_uL] = 72,
    _a[DATA_KEYS.claims__specimen__supported_types] = 0,
    _a[DATA_KEYS.claims__specimen__transport_medium] = 34,
    _a[DATA_KEYS.claims__target_viral_genes] = 6,
    _a[DATA_KEYS.validation_condition__author] = 24,
    _a[DATA_KEYS.validation_condition__date] = 25,
    _a[DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix] = 64,
    _a[DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix_source] = 86,
    _a[DATA_KEYS.validation_condition__synthetic_specimen__viral_material] = 62,
    _a[DATA_KEYS.validation_condition__synthetic_specimen__viral_material_source] = 63,
    _a);
function get_all_annotation_label_ids() {
    var all_annotation_label_ids = new Set();
    Object.values(annotations_by_test_name)
        .forEach(function (annotation_files) {
        annotation_files.forEach(function (annotation_file) {
            annotation_file.annotations
                .filter(is_annotation)
                .forEach(function (annotation) {
                annotation.labels.forEach(function (label) {
                    all_annotation_label_ids.add(label.id);
                });
            });
        });
    });
    return all_annotation_label_ids;
}
var all_annotation_label_ids = Array.from(get_all_annotation_label_ids());
// Report on unused labels
var LABEL_IDS_MAPPED_TO_DATA_KEY = new Set(Object.values(MAP_DATA_KEY_TO_LABEL_ID));
var LABEL_ID__META__NOT_SPECIFIED = 73;
var LABEL_ID__META__ERROR = 74;
var LABEL_ID__META__POTENTIAL_ERROR = 99;
var LABEL_IDS_HANDLED_ELSE_WHERE = [
    LABEL_ID__META__NOT_SPECIFIED,
    LABEL_ID__META__ERROR,
    LABEL_ID__META__POTENTIAL_ERROR,
];
LABEL_IDS_HANDLED_ELSE_WHERE.forEach(function (label_id) { return LABEL_IDS_MAPPED_TO_DATA_KEY.add(label_id); });
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
];
LABEL_IDS_TO_SILENCE.forEach(function (label_id) { return LABEL_IDS_MAPPED_TO_DATA_KEY.add(label_id); });
var unhandled_label_ids = all_annotation_label_ids.filter(function (x) { return !LABEL_IDS_MAPPED_TO_DATA_KEY.has(x); });
console.log("Unhandled label ids: " + unhandled_label_ids.map(function (id) { return "\n * " + id + " -> " + labels[id]; }));
var extracted_data = fda_eua_parsed_data
    .slice(1) // skip first row of json array which contains csv-like array of headers
    .map(function (fda_eua_parsed_data_row) {
    var test_name = fda_eua_parsed_data_row[2];
    var manufacturer_name = fda_eua_parsed_data_row[1];
    var date = fda_eua_parsed_data_row[0];
    var row = {
        test_descriptor__manufacturer_name: {
            value: manufacturer_name,
            refs: []
        },
        test_descriptor__test_name: {
            value: test_name,
            refs: []
        },
        validation_condition__author: {
            value: "self",
            refs: []
        },
        validation_condition__date: {
            value: date,
            refs: []
        }
    };
    add_data_from_annotations(row);
    return row;
});
function add_data_from_annotations(row) {
    var test_name = row[DATA_KEYS.test_descriptor__test_name].value;
    var annotation_files = annotations_by_test_name[test_name];
    if (!annotation_files)
        return;
    Object.keys(MAP_DATA_KEY_TO_LABEL_ID).forEach(function (data_key) {
        add_specific_data_from_annotations(row, data_key, annotation_files);
    });
}
function add_specific_data_from_annotations(row, data_key, annotation_files) {
    var label_id = MAP_DATA_KEY_TO_LABEL_ID[data_key];
    var annotations = filter_annotation_files_for_label(annotation_files, label_id);
    apply_data_string(row, data_key, annotations);
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
function apply_data_string(row, data_key, annotations) {
    if (annotations.length === 0)
        return;
    var WARNING_HTML_SYMBOL = "<span class=\"warning_symbol\" title=\"Value not specified\">\u26A0</span>";
    var ERROR_HTML_SYMBOL = "<span class=\"error_symbol\" title=\"Potential error\">\u26A0</span>";
    var includes_warning = false;
    var includes_error = false;
    var comments = "";
    var value = annotations.map(function (annotation) {
        var value = annotation.text;
        if (annotation.labels.find(function (label) { return label.id === LABEL_ID__META__NOT_SPECIFIED; })) {
            includes_warning = true;
            var append_text = value ? value + " (not specified)" : "Not specified";
            value = WARNING_HTML_SYMBOL + " " + append_text;
        }
        if (annotation.labels.find(function (label) { return label.id === LABEL_ID__META__ERROR || label.id === LABEL_ID__META__POTENTIAL_ERROR; })) {
            includes_error = true;
            value = ERROR_HTML_SYMBOL + " " + value;
        }
        if (annotation.comment) {
            comments += "<span title=\"" + html_safe_ish(annotation.comment) + "\">C</span> ";
        }
        return value;
    }).join(", ");
    if (includes_warning) {
        //value = `${WARNING_HTML_SYMBOL} ${value}`
    }
    if (includes_error) {
        //value = `${ERROR_HTML_SYMBOL} ${value}`
    }
    value = value + "<br/>" + comments;
    var refs = annotations.map(function (annotation) { return ref_link(annotation.relative_file_path, annotation.id); });
    var data_node = { value: value, refs: refs };
    row[data_key] = data_node;
}
function ref_link(relative_file_path, annotation_id) {
    var ref = "http://localhost:5003/render_pdf?relative_file_path=" + relative_file_path;
    if (annotation_id !== undefined)
        ref += "&highlighted_annotation_ids=" + annotation_id;
    return ref;
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
// extracted_data.forEach(row =>
// {
//     const test_name = row[DATA_KEYS.test_descriptor__test_name].value
//     const fda_eua = FDA_EUA_parsed_data_by_test_name[test_name]
//     if (fda_eua)
//     {
//         row[DATA_KEYS.test_descriptor__manufacturer_name] =
//         {
//             value: fda_eua[DATA_KEYS.test_descriptor__manufacturer_name],
//             refs: [],
//         }
//         // Will likely delete this as EUA date is not the same as
//         // validation date if more recent data is given
//         const author = row[DATA_KEYS.validation_condition__author]
//         if (author && author.value === "self")
//         {
//             row[DATA_KEYS.validation_condition__date] =
//             {
//                 value: fda_eua[DATA_KEYS.validation_condition__date],
//                 refs: [],
//             }
//         }
//     }
//     else
//     {
//         console.error(`test_name "${test_name}" not present in fda_eua_parsed_data.`)
//     }
// })
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
        data_key: null,
        category: "test_descriptor",
        children: [
            {
                title: "Name",
                data_key: DATA_KEYS.test_descriptor__manufacturer_name
            },
            {
                title: "Test name",
                data_key: DATA_KEYS.test_descriptor__test_name
            },
        ]
    },
    {
        title: "Claims",
        data_key: null,
        category: "test_claims",
        children: [
            {
                title: "Specimens",
                data_key: null,
                children: [
                    {
                        title: "Supported specimen types",
                        data_key: DATA_KEYS.claims__specimen__supported_types
                    },
                    {
                        title: "Transport medium",
                        data_key: DATA_KEYS.claims__specimen__transport_medium
                    },
                ]
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Appropriate testing population",
                // e.g. * patients suspected of COVID-19 by a healthcare provider
                //      * pooled samples
                //      * general, asymptomatic screening population i.e. screening of individuals without symptoms or other reasons to suspect COVID-19
                data_key: null
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Sample pooling",
                data_key: null,
                children: [
                    { title: "Approach", data_key: null },
                    { title: "Max no. specimens", data_key: null },
                ]
            },
            { title: "Target gene(s) of SARS-CoV-2", data_key: DATA_KEYS.claims__target_viral_genes },
            {
                title: "Primers and probes",
                data_key: null,
                children: [
                    { title: "Sequences", data_key: DATA_KEYS.claims__primers_and_probes__sequences },
                    { title: "Sources", data_key: DATA_KEYS.claims__primers_and_probes__sources },
                ]
            },
            {
                title: "Test technology",
                // e.g. RT-qPCR
                data_key: null
            },
            {
                // Not in May 13th version of FDA EUA template
                // i.e. can include more than just SARS-CoV-2
                title: "Detects pathogen(s)",
                data_key: null
            },
            {
                title: "Limit of Detection (LOD)",
                data_key: null,
                children: [
                    {
                        title: "value",
                        data_key: DATA_KEYS.claims__limit_of_detection__value
                    },
                    {
                        title: "units",
                        data_key: DATA_KEYS.claims__limit_of_detection__units
                    },
                    {
                        title: "Minimum replicates",
                        data_key: DATA_KEYS.claims__limit_of_detection__minimum_replicates
                    },
                ]
            },
            {
                title: "Intended user",
                // e.g. CLIA labs
                data_key: null
            },
            { title: "Compatible equipment", data_key: null },
            // {
            // Product Overview/Test Principle...
            //     // primer and probe sets and briefly describe what they detect. Please include the nucleic acid sequences for all primers and probes used in the test. Please indicate if the test uses biotin-Streptavidin/avidin chemistry
            // },
            {
                title: "Controls",
                data_key: null,
                children: [
                    { title: "Human gene", data_key: DATA_KEYS.claims__controls__internal__human_gene_target },
                ]
            },
            {
                title: "RNA extraction",
                data_key: null,
                children: [
                    { title: "Specimen input volume", data_key: null },
                    { title: "RNA extraction method(s)", data_key: null },
                    { title: "Nucleic acid elution volume", data_key: null },
                    { title: "Purification manual &/ automated", data_key: null },
                ]
            },
            {
                title: "Reverse transcription",
                data_key: null,
                children: [
                    { title: "Input volume", data_key: null },
                    { title: "Enzyme mix / kits", data_key: null },
                ]
            },
            {
                title: "PCR / amplification",
                data_key: null,
                children: [
                    { title: "Instrument", data_key: null },
                    { title: "Enzyme mix / kits", data_key: null },
                    { title: "Reaction volume / μL", data_key: DATA_KEYS.claims__reaction_volume_uL },
                ]
            },
            {
                title: "PCR quantification fluoresence detection",
                data_key: null,
                children: [
                    { title: "Instrument", data_key: null },
                ]
            },
        ]
    },
    {
        title: "Validation conditions",
        data_key: null,
        category: "validation_condition",
        children: [
            {
                title: "Author",
                data_key: DATA_KEYS.validation_condition__author
            },
            {
                title: "Date",
                data_key: DATA_KEYS.validation_condition__date
            },
            {
                title: "Patient details",
                data_key: null,
                children: [
                    { title: "Age", data_key: null },
                    { title: "Race", data_key: null },
                    { title: "Gender", data_key: null },
                ]
            },
            { title: "Disease stage", data_key: null },
            {
                title: "Synthetic Specimen",
                data_key: null,
                children: [
                    { title: "Viral material", data_key: DATA_KEYS.validation_condition__synthetic_specimen__viral_material },
                    { title: "Viral material source", data_key: DATA_KEYS.validation_condition__synthetic_specimen__viral_material_source },
                    { title: "Clinical matrix", data_key: DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix },
                    { title: "Clinical matrix source", data_key: DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix_source },
                ]
            },
            {
                title: "Specimen",
                data_key: null,
                children: [
                    { title: "Type", data_key: DATA_KEYS.validation_condition__specimen_type },
                    { title: "Swab type", data_key: DATA_KEYS.validation_condition__swab_type },
                    { title: "Transport medium", data_key: DATA_KEYS.validation_condition__transport_medium },
                    { title: "Sample volume", data_key: DATA_KEYS.validation_condition__sample_volume },
                ]
            },
        ]
    },
    {
        title: "Overall score",
        data_key: null,
        category: "metric"
    },
    {
        title: "Metrics",
        data_key: null,
        category: "metric",
        children: [
            {
                title: "Number of clinical samples",
                data_key: null,
                children: [
                    {
                        title: "Positives",
                        data_key: DATA_KEYS.metrics__num_clinical_samples__positive
                    },
                    {
                        title: "Controls (negatives)",
                        data_key: DATA_KEYS.metrics__num_clinical_samples__negative_controls
                    },
                ]
            },
            {
                title: "Comparator test",
                data_key: DATA_KEYS.validation_condition__comparator_test
            },
            {
                title: "Confusion matrix",
                data_key: null,
                children: [
                    { title: "True positives", data_key: DATA_KEYS.metrics__confusion_matrix__true_positives },
                    { title: "False negatives", data_key: DATA_KEYS.metrics__confusion_matrix__false_negatives },
                    { title: "True negatives", data_key: DATA_KEYS.metrics__confusion_matrix__true_negatives },
                    { title: "False positives", data_key: DATA_KEYS.metrics__confusion_matrix__false_positives },
                ]
            },
        ]
    },
    {
        title: "Derived values",
        data_key: null,
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
function populate_table_body(headers, data) {
    var table_el = document.getElementById("data_table");
    var tbody_el = table_el.getElementsByTagName("tbody")[0];
    data.forEach(function (data_row) {
        var row = tbody_el.insertRow();
        iterate_lowest_header(headers, function (header) {
            var cell = row.insertCell();
            if (header.data_key !== null && data_row[header.data_key]) {
                var data_node = data_row[header.data_key];
                var value = data_node.value.toString();
                var value_title = html_safe_ish(value);
                var value_el_1 = document.createElement("div");
                value_el_1.className = "value_el";
                value_el_1.innerHTML = value;
                value_el_1.title = value_title;
                value_el_1.addEventListener("click", function () {
                    value_el_1.classList.toggle("expanded");
                });
                cell.appendChild(value_el_1);
                var ref_container_el = document.createElement("div");
                var refs = data_node.refs;
                ref_container_el.innerHTML = refs.map(function (r) { return " <a class=\"reference\" href=\"" + r + "\">R</a>"; }).join(" ");
                cell.appendChild(ref_container_el);
            }
        });
    });
}
function update_progress() {
    var progress_el = document.getElementById("progress");
    var tbody = document.getElementsByTagName("tbody")[0];
    var total_rows = tbody.children.length;
    var total_completed = 0;
    Array.from(tbody.children).forEach(function (row) {
        total_completed += (row.children[2].innerHTML !== "" ? 1 : 0);
    });
    var percentage = ((total_completed / total_rows) * 100).toFixed(1);
    progress_el.innerText = percentage + "% " + total_completed + "/" + total_rows;
}
// DO NOT USE THIS IN PRODUCTION
function html_safe_ish(value) {
    return value.replace(/(<([^>]+)>)/ig, "")
        .replace(/"/ig, "'");
}
activate_options();
build_header(headers);
populate_table_body(headers, extracted_data);
update_progress();
