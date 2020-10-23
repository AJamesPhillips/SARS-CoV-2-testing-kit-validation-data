
type FDA_EUA_PARSED_DATA_ROW = [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string[],
    string,
    string[],
    string, // TODO remove anot8_org_file_id
]
type FDA_EUA_PARSED_DATA = FDA_EUA_PARSED_DATA_ROW[]


interface Annotation
{
    id: number
    page_number: number
    left: string
    top: string
    width: string
    height: string
    colour: string
    text: string
    labels: string[]
    comment: string
    anot8_org_file_id: string // added to each annotation by the server, // TODO remove anot8_org_file_id
    deleted?: false  // should not actually ever be present
}
interface DeletedAnnotation
{
    id: number
    deleted: true
}
type AnnotationEntry = Annotation | DeletedAnnotation
function is_annotation (annotation: AnnotationEntry): annotation is Annotation {
    return !annotation.deleted
}

interface AnnotationFile
{
    version: number
    file_sha1_hash: string
    annotations: AnnotationEntry[]
    comments: string[]
}
interface ANNOTATION_FILES_BY_TEST_ID
{
    [test_id: string]: AnnotationFile[]
}


declare var fda_eua_parsed_data: FDA_EUA_PARSED_DATA
declare var annotation_files_by_test_id: ANNOTATION_FILES_BY_TEST_ID


const labels = {
    claims__controls__internal__human_gene_target: "Controls/Internal/Human gene target",
    claims__limit_of_detection__minimum_replicates: "Limit of Detection (LOD)/Minimum Replicates",
    claims__limit_of_detection__value: "Limit of Detection (LOD)/Value",
    claims__limit_of_detection__units: "Limit of Detection (LOD)/Units",
    claims__primers_and_probes__sequences: "Primers and probes/Sequences",
    claims__primers_and_probes__sources: "Primers and probes/Sources",
    claims__reaction_volume_uL: "Nucleic acid amplification/Reaction/Volume in μL",
    claims__specimen__supported_types: "Supported specimen types",
    claims__specimen__transport_medium: "Specimen/Transport medium",
    claims__target_viral_genes: "Viral gene(s) targetted",
    meta__error: "Meta/Error",
    meta__error__omission: "Meta/Error/Omission",
    meta__not_specified: "Meta/Not specified",
    meta__not_specified__partial_info: "Meta/Not specified/Partial information to reproduce",
    meta__potential_error: "Meta/Potential error",
    metrics__confusion_matrix__false_negatives: "Confusion matrix/False negatives",
    metrics__confusion_matrix__false_positives: "Confusion matrix/False positives",
    metrics__confusion_matrix__true_negatives: "Confusion matrix/True negatives",
    metrics__confusion_matrix__true_positives: "Confusion matrix/True positives",
    metrics__num_clinical_samples__negative_controls: "Number of clinical samples/Controls (negatives)",
    metrics__num_clinical_samples__positive: "Number of clinical samples/Positives",
    synthetic_specimen_virus_type_Naked_RNA: "Specimen/Synthetic Specimen/Virus/Type/Naked RNA",
    synthetic_specimen_virus_type_Antigens: "Specimen/Synthetic Specimen/Virus/Type/Antigens",
    synthetic_specimen_virus_type_Synthetic_Viral_Particles: "Specimen/Synthetic Specimen/Virus/Type/Synthetic Viral Particles",
    synthetic_specimen_virus_type_Inactivated_Virus__Heat: "Specimen/Synthetic Specimen/Virus/Type/Inactivated Virus (Heat)",
    synthetic_specimen_virus_type_Inactivated_Virus__Gammma: "Specimen/Synthetic Specimen/Virus/Type/Inactivated Virus (Gamma radiation)",
    synthetic_specimen_virus_type_Inactivated_Virus__Chemical: "Specimen/Synthetic Specimen/Virus/Type/Inactivated Virus (Chemical)",
    synthetic_specimen_virus_type_Inactivated_Virus__method_not_specified: "Specimen/Synthetic Specimen/Virus/Type/Inactivated Virus (method unspecified)",
    synthetic_specimen_virus_type_Live_Virus: "Specimen/Synthetic Specimen/Virus/Type/Live Virus",
    synthetic_specimen_virus_type_Partial_Live_Virus: "Specimen/Synthetic Specimen/Virus/Type/Partial Live Virus",
    test_descriptor__manufacturer_name: "Test manufacturer",
    test_descriptor__test_name: "Test name",
    test_technology: "Test technology",
    validation_condition__author: "Author",
    validation_condition__comparator_test: "-1",
    validation_condition__date: "Date",
    validation_condition__sample_volume: "-1",
    validation_condition__specimen_type: "-1",
    validation_condition__swab_type: "-1",
    validation_condition__synthetic_specimen__clinical_matrix: "Specimen/Synthetic Specimen/Clinical matrix",
    validation_condition__synthetic_specimen__clinical_matrix_source: "Specimen/Synthetic Specimen/Clinical matrix/Source",
    validation_condition__synthetic_specimen__viral_material: "Specimen/Synthetic Specimen/Virus",
    validation_condition__synthetic_specimen__viral_material_source: "Specimen/Synthetic Specimen/Virus/Source",
    validation_condition__transport_medium: "-1",

    // This smells and suggests we should have kept the second layer of data_keys in conjunction with labels
    _extra_url_to_IFU_or_EUA: "-2",
}
type LABELS = typeof labels


const LABELS__META__NOT_SPECIFIED = [
    labels.meta__not_specified,
    labels.meta__not_specified__partial_info,
]
const LABELS__META__ERRORS = [
    labels.meta__error,
    labels.meta__potential_error,
]
const LABELS__META = [
    ...LABELS__META__NOT_SPECIFIED,
    ...LABELS__META__ERRORS,
]

function get_used_annotation_labels (annotation_files_by_test_id: ANNOTATION_FILES_BY_TEST_ID)
{
    const used_annotation_labels = new Set<string>()

    ;(Object as any).values(annotation_files_by_test_id)
        .forEach((annotation_files: AnnotationFile[]) =>
        {
            annotation_files.forEach(annotation_file =>
            {
                annotation_file.annotations
                .filter(is_annotation)
                .forEach(annotation =>
                {
                    annotation.labels.forEach(label => used_annotation_labels.add(label))
                })
            })
        })

    return used_annotation_labels
}


// Report on unused labels
function report_on_unused_labels (used_annotation_labels: string[])
{
    const HANDLED_LABELS = new Set<string>((Object as any).values(labels))

    const LABELS_TO_SILENCE = [
        "Controls/Internal",
        "Controls/Internal/Extraction control material/Description",
        "Controls/Internal/Extraction control material/Source",
        "Controls/Internal/Full process",
        "Detects pathogen(s)",
        "Limit of Detection (LOD)/Concentration Range/Dilution per step",
        "Limit of Detection (LOD)/Concentration Range/Number of steps",
        "Limit of Detection (LOD)/Protocol",
        "Meta/Error/Omission",
        "Meta/Not specified/Reasonable assumption",
        "Meta/Question to answer",
        "Potential interfering substances",
        "Potential interfering substances/Test synthetic sample",
        "Primers and probes/Source",
        "RNA extraction & purification/Elution volume ul",
        "RNA extraction & purification/Specimen input volume ul",
        "Reverse transcription/Input volume ul",
        "Specimen/Collection protocol",
        "Specimen/Swab type",
        "Specimen/Synthetic Specimen/Clinical matrix/Source",
        "Specimen/Synthetic Specimen/Other components",
        "Specimen/Synthetic Specimen/Production method",
        "Specimen/Synthetic Specimen/Swab type",
        "Specimen/Synthetic Specimen/Transport medium",
        "Specimen/Transport container(s)",
        "Specimen/Volume ul",
        "Statistics/Confidence intervals/Lower value",
        "Statistics/Confidence intervals/Percentage",
        "Statistics/Confidence intervals/Upper value",
        "Third party detection system",
        "Time to test result in minutes",
        "Viral protein(s) targetted",
    ]
    LABELS_TO_SILENCE.forEach(label => HANDLED_LABELS.add(label))

    const unhandled_labels = used_annotation_labels.filter(x => !HANDLED_LABELS.has(x))

    if (unhandled_labels.length)
    {
        console.log(`Unhandled labels: ${unhandled_labels.map(label => `\n * ${label}`)}`)
    }
}


interface DATA_NODE
{
    annotations: Annotation[]

    // Other fields added during rendering
    // TODO: remove this complete hack
    html_display_string?: string
    refs?: string[]
    data?: any
}
type DATA_ROW =
{
    test_id: string
} | {
    [label: string]: DATA_NODE
}


function reformat_fda_eua_parsed_data_as_rows (fda_eua_parsed_data: FDA_EUA_PARSED_DATA): DATA_ROW[]
{
    return fda_eua_parsed_data
    .slice(1) // skip first row of json array which contains csv-like array of headers
    .map(fda_eua_parsed_data_row =>
        {
            const test_id = fda_eua_parsed_data_row[0]
            const date = fda_eua_parsed_data_row[1]
            const manufacturer_name = fda_eua_parsed_data_row[3]
            const test_name = fda_eua_parsed_data_row[4]
            const test_technology = fda_eua_parsed_data_row[6]
            const EUAs = fda_eua_parsed_data_row[10]
            const url_to_IFU_or_EUA = EUAs.length ? EUAs[0] : fda_eua_parsed_data_row[11]
            const anot8_org_file_id = fda_eua_parsed_data_row[13] // TODO remove anot8_org_file_id

            const row: DATA_ROW = {
                test_id,
                [labels.validation_condition__date]: {
                    annotations: [],
                    data: { value: date },
                },
                [labels.test_descriptor__test_name]: {
                    annotations: [],
                    data: { value: test_name },
                },
                [labels.test_descriptor__manufacturer_name]: {
                    annotations: [],
                    data: { value: manufacturer_name },
                },
                [labels.test_technology]: {
                    annotations: [],
                    data: { value: test_technology },
                },
                [labels.validation_condition__author]: {
                    annotations: [],
                    data: { value: "self" },
                },
                [labels._extra_url_to_IFU_or_EUA]: {
                    annotations: [],
                    data: { value: anot8_org_file_id },
                },
            }

            return row
        })
}


function add_data_from_annotations (row: DATA_ROW, annotation_files_by_test_id: ANNOTATION_FILES_BY_TEST_ID, labels: LABELS)
{
    const test_id = row.test_id as string

    const annotation_files = annotation_files_by_test_id[test_id]
    if (!annotation_files) return

    ;(Object as any).values(labels).forEach((label: string) =>
        {
            if (row[label]) return // hack to avoid overwriting fields already set from parse FDA EUA data

            const annotations = filter_annotation_files_for_label(annotation_files, label)
            row[label] = { annotations, refs: annotations.map(ref_link) }
        })
}


function filter_annotation_files_for_label (annotation_files: AnnotationFile[], label: string): Annotation[]
{
    let annotations: Annotation[] = []
    annotation_files.forEach(annotation_file =>
        {
            annotations = [...annotations, ...filter_annotations_for_label(annotation_file, label)]
        })

    return annotations
}


function filter_annotations_for_label (annotation_file: AnnotationFile, label: string): Annotation[]
{
    return annotation_file.annotations
        .filter(is_annotation)
        .filter(annotation =>
            {
                return annotation.labels.filter(l => l === label).length
            })
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



function activate_options ()
{
    let cells_expanded = false
    document.getElementById("toggle_expanded_cells").onclick = () =>
    {
        cells_expanded = !cells_expanded
        const cells = Array.from(document.getElementsByClassName("value_el"))
        if (cells_expanded)
        {
            cells.forEach(cell => cell.classList.add("expanded"))
        }
        else
        {
            cells.forEach(cell => cell.classList.remove("expanded"))
        }
    }
}


interface HEADER {
    title: string
    label: string
    hidden?: boolean
}
type HEADERS =
(HEADER & {
    category: string
    children?: (HEADER & {
        children?: HEADER[]
    })[]
})[]

const headers: HEADERS = [
    {
        title: "Manufacturer",
        label: null,
        category: "test_descriptor",
        children: [
            {
                title: "Name",
                label: labels.test_descriptor__manufacturer_name,
            },
            {
                title: "Test name",
                label: labels.test_descriptor__test_name,
            },
            {
                title: "IFU or EUA",
                label: labels._extra_url_to_IFU_or_EUA,
            }
        ],
    },
    {
        title: "Claims",
        label: null,
        category: "test_claims",
        children: [
            {
                title: "Test technology",
                label: labels.test_technology,
            },
            {
                title: "Specimens",
                label: null,
                children: [
                    {
                        title: "Supported specimen types",
                        label: labels.claims__specimen__supported_types,
                    },
                    {
                        title: "Transport medium",
                        label: labels.claims__specimen__transport_medium,
                    },
                ]
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Appropriate testing population",
                // e.g. * patients suspected of COVID-19 by a healthcare provider
                //      * pooled samples
                //      * general, asymptomatic screening population i.e. screening of individuals without symptoms or other reasons to suspect COVID-19
                label: null,
                hidden: true,
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Sample pooling",
                label: null,
                hidden: true,
                children: [
                    { title: "Approach", label: null, hidden: true, },
                    { title: "Max no. specimens", label: null, hidden: true, },
                ]
            },
            { title: "Target gene(s) of SARS-CoV-2", label: labels.claims__target_viral_genes, },
            {
                title: "Primers and probes",
                label: null,
                children: [
                    { title: "Sequences", label: labels.claims__primers_and_probes__sequences, },
                    { title: "Sources", label: labels.claims__primers_and_probes__sources, hidden: true, },
                ]
            },
            {
                // Not in May 13th version of FDA EUA template
                // i.e. can include more than just SARS-CoV-2
                title: "Detects pathogen(s)",
                label: null,
                hidden: true,
            },
            {
                title: "Limit of Detection (LOD)",
                label: null,
                children: [
                    {
                        title: "value",
                        label: labels.claims__limit_of_detection__value,
                    },
                    {
                        title: "units",
                        label: labels.claims__limit_of_detection__units,
                    },
                    {
                        title: "Minimum replicates",
                        label: labels.claims__limit_of_detection__minimum_replicates,
                    },
                ]
            },
            {
                title: "Intended user",
                // e.g. CLIA labs
                label: null,
                hidden: true,
            },
            { title: "Compatible equipment", label: null, hidden: true, },
            // {
                // Product Overview/Test Principle...
                //     // primer and probe sets and briefly describe what they detect. Please include the nucleic acid sequences for all primers and probes used in the test. Please indicate if the test uses biotin-Streptavidin/avidin chemistry
                // },
            {
                title: "Controls",
                label: null,
                children: [
                    { title: "Human gene", label: labels.claims__controls__internal__human_gene_target, },
                ]
            },
            {
                title: "RNA extraction",
                label: null,
                children: [
                    { title: "Specimen input volume", label: null, hidden: true, },
                    { title: "RNA extraction method(s)", label: null, hidden: true, },
                    { title: "Nucleic acid elution volume", label: null, hidden: true, },
                    { title: "Purification manual &/ automated", label: null, hidden: true, },
                ]
            },
            {
                title: "Reverse transcription",
                label: null,
                children: [
                    { title: "Input volume", label: null, hidden: true, },
                    { title: "Enzyme mix / kits", label: null, hidden: true, },
                ]
            },
            {
                title: "PCR / amplification",
                label: null,
                children: [
                    { title: "Instrument", label: null, hidden: true, },
                    { title: "Enzyme mix / kits", label: null, hidden: true, },
                    { title: "Reaction volume / μL", label: labels.claims__reaction_volume_uL, },
                ]
            },
            {
                title: "PCR quantification fluoresence detection",
                label: null,
                children: [
                    { title: "Instrument", label: null, hidden: true, },
                ]
            },
        ],
    },
    {
        title: "Validation conditions",
        label: null,
        category: "validation_condition",
        children: [
            {
                title: "Author",
                label: labels.validation_condition__author,
            },
            {
                title: "Date",
                label: labels.validation_condition__date,
            },
            {
                title: "Patient details",
                label: null,
                children: [
                    { title: "Age", label: null, hidden: true, },
                    { title: "Race", label: null, hidden: true, },
                    { title: "Gender", label: null, hidden: true, },
                ]
            },
            { title: "Disease stage", label: null, hidden: true, },
            {
                title: "Synthetic Specimen",
                label: null,
                children: [
                    { title: "Viral material", label:labels.validation_condition__synthetic_specimen__viral_material, },
                    { title: "Viral material source", label:labels.validation_condition__synthetic_specimen__viral_material_source, },
                    { title: "Clinical matrix", label:labels.validation_condition__synthetic_specimen__clinical_matrix, },
                    { title: "Clinical matrix source", label:labels.validation_condition__synthetic_specimen__clinical_matrix_source, },
                ]
            },
            {
                title: "Specimen",
                label: null,
                children: [
                    {
                        title: "Type",
                        label: labels.validation_condition__specimen_type,
                        hidden: true,
                    },
                    {
                        title: "Swab type",
                        label: labels.validation_condition__swab_type,
                        hidden: true,
                    },
                    {
                        title: "Transport medium",
                        label: labels.validation_condition__transport_medium,
                        hidden: true,
                    },
                    {
                        title: "Sample volume",
                        label: labels.validation_condition__sample_volume,
                        hidden: true,
                    },
                ]
            },
        ],
    },
    {
        title: "Overall score",
        label: null,
        category: "metric",
        hidden: true,
    },
    {
        title: "Metrics",
        label: null,
        category: "metric",
        children: [
            {
                title: "Number of clinical samples",
                label: null,
                children: [
                    {
                        title: "Positives",
                        label: labels.metrics__num_clinical_samples__positive,
                        hidden: true,
                    },
                    {
                        title: "Controls (negatives)",
                        label: labels.metrics__num_clinical_samples__negative_controls,
                        hidden: true,
                    },
                ]
            },
            {
                title: "Comparator test",
                label: labels.validation_condition__comparator_test,
                hidden: true,
            },
            {
                title: "Confusion matrix",
                label: null,
                children: [
                    {
                        title: "True positives",
                        label: labels.metrics__confusion_matrix__true_positives,
                        hidden: true,
                    },
                    {
                        title: "False negatives",
                        label: labels.metrics__confusion_matrix__false_negatives,
                        hidden: true,
                    },
                    {
                        title: "True negatives",
                        label: labels.metrics__confusion_matrix__true_negatives,
                        hidden: true,
                    },
                    {
                        title: "False positives",
                        label: labels.metrics__confusion_matrix__false_positives,
                        hidden: true,
                    },
                ]
            },
        ],
    },
    {
        title: "Derived values",
        label: null,
        category: "derived_values",
        children: [],
        hidden: true,
    },
]


function build_header (headers: HEADERS)
{
    const table_el = document.getElementById("data_table")
    const thead_el = table_el.getElementsByTagName("thead")[0]
    const row1 = thead_el.insertRow()
    const row2 = thead_el.insertRow()
    const row3 = thead_el.insertRow()

    for (let i1 = 0; i1 < headers.length; ++i1)
    {
        const element1 = headers[i1]
        const className = `${element1.category} header_label`

        let row1_width = 0
        let row1_height = 1
        if (!(element1.children && element1.children.length))
        {
            row1_width = (element1.hidden ? 0 : 1)
            row1_height = 3
        }
        else for (let i2 = 0; i2 < element1.children.length; ++i2)
        {
            const element2 = element1.children[i2]

            let row2_width = 0
            let row2_height = 1
            if (!(element2.children && element2.children.length))
            {
                row2_width = (element2.hidden ? 0 : 1)
                row2_height = 2
            }
            else for (let i3 = 0; i3 < element2.children.length; ++i3)
            {
                const element3 = element2.children[i3]
                row2_width += (element3.hidden ? 0 : 1)

                const cell3 = document.createElement("th")
                row3.appendChild(cell3)
                cell3.innerHTML = element3.title
                cell3.className = className + (element3.hidden ? " hidden" : "")
            }

            const cell2 = document.createElement("th")
            row2.appendChild(cell2)
            cell2.innerHTML = element2.title
            cell2.colSpan = row2_width
            cell2.rowSpan = row2_height
            cell2.className = className + ((element2.hidden || (row2_width === 0)) ? " hidden" : "")

            row1_width += row2_width
        }

        const cell1 = document.createElement("th")
        row1.appendChild(cell1)
        cell1.innerHTML = element1.title
        cell1.colSpan = row1_width
        cell1.rowSpan = row1_height
        cell1.className = className + ((element1.hidden || (row1_width === 0)) ? " hidden" : "")
    }
}


function iterate_lowest_header (headers: HEADERS, func: (header: HEADER) => void)
{
    for (let i1 = 0; i1 < headers.length; ++i1)
    {
        const element1 = headers[i1]

        if (!(element1.children && element1.children.length))
        {
            func(element1)
        }
        else for (let i2 = 0; i2 < element1.children.length; ++i2)
        {
            const element2 = element1.children[i2]

            if (!(element2.children && element2.children.length))
            {
                func(element2)
            }
            else for (let i3 = 0; i3 < element2.children.length; ++i3)
            {
                const element3 = element2.children[i3]
                func(element3)
            }
        }
    }
}


function has_only_subset_of_labels(labels: string[], allowed_subset_labels: string[])
{
    const allowed = new Set(allowed_subset_labels)
    return labels.filter(label => !allowed.has(label)).length === 0
}


interface VALUE_FOR_CELL <D> { string: string, refs: string[], data?: D }
type VALUE_HANDLER<D> = (data_node: DATA_NODE) => VALUE_FOR_CELL<D>

function data_value_handler (data_node: DATA_NODE): VALUE_FOR_CELL<{ value: string }>
{
    let value = (data_node.data || {}).value
    if (value === undefined) console.warn(`No .data.value present in: `, data_node)
    value = value || ""

    return { string: value, refs: data_node.refs || [], data: { value } }
}

function annotations_value_handler (data_node: DATA_NODE): VALUE_FOR_CELL<{ value: string }>
{
    const annotations = data_node.annotations

    let value = ""
    let string = ""

    if (annotations.length > 0)
    {
        value = value_from_annotations(annotations)
        const comments = comments_from_annotations(annotations)

        string = value + "<br/>" + comments
    }

    return { string, refs: data_node.refs || [], data: { value } }
}


const WARNING_HTML_SYMBOL = `<span class="warning_symbol" title="Value not specified">⚠</span>`
const ERROR_HTML_SYMBOL = `<span class="error_symbol" title="Potential error">⚠</span>`
function not_specified_value_html (value: string)
{
    const append_text = value ? value + " (not specified)" : "Not specified"
    return `${WARNING_HTML_SYMBOL} ${append_text}`
}


function value_from_annotations (annotations: Annotation[]): string
{
    let includes_warning = false
    let includes_error = false

    let value = annotations.map(annotation => {
        let value = annotation.text

        if (annotation.labels.find(label => LABELS__META__NOT_SPECIFIED.includes(label)))
        {
            includes_warning = true
            value = not_specified_value_html(value)
        }

        if (annotation.labels.find(label => LABELS__META__ERRORS.includes(label)))
        {
            includes_error = true
            value = `${ERROR_HTML_SYMBOL} ${value}`
        }

        return value
    }).join(", ")

    if (includes_warning && !value.startsWith(WARNING_HTML_SYMBOL))
    {
        value = `${WARNING_HTML_SYMBOL} ${value}`
    }

    if (includes_error && !value.startsWith(ERROR_HTML_SYMBOL))
    {
        value = `${ERROR_HTML_SYMBOL} ${value}`
    }

    return value
}


function comments_from_annotations (annotations: Annotation[]): string
{
    let comments = ""

    annotations.forEach(annotation => {
        if (annotation.comment)
        {
            comments += `<span title="${html_safe_ish(annotation.comment)}">C</span> `
        }
    })

    return comments
}


function ref_link (annotation: { anot8_org_file_id: string, id?: number })
{
    const { anot8_org_file_id, id } = annotation
    // let ref = `http://localhost:5003/r/1772.2/${anot8_org_file_id}`
    let ref = `https://anot8.org/r/1772.2/${anot8_org_file_id}`

    if (id !== undefined) ref += `?highlighted_annotation_ids=${id}`

    return ref
}



const lod_allowed_labels = [ labels.claims__limit_of_detection__value, ...LABELS__META ]
type lod_value_data = { min: number, max: number } | { not_specified: true }
function lod_value_handler (data_node: DATA_NODE): VALUE_FOR_CELL<lod_value_data>
{
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    let min_annotation
    let max_annotation

    data_node.annotations
        .forEach(annotation =>
            {
                if (has_only_subset_of_labels(annotation.labels, lod_allowed_labels))
                {
                    const v = parseFloat(annotation.text)
                    const new_min = Math.min(min, v)
                    const new_max = Math.max(max, v)

                    if (new_min !== min)
                    {
                        min = new_min
                        min_annotation = annotation
                    }

                    if (new_max !== max)
                    {
                        max = new_max
                        max_annotation = annotation
                    }
                }
            })

    if (!min_annotation)
    {
        return {
            string: "",
            refs: [],
            data: { not_specified: true },
        }
    }

    const same = min === max
    const comments = same ? comments_from_annotations([min_annotation]) : comments_from_annotations([min_annotation, max_annotation])
    const string = (same ? `${min}` : `${min} <-> ${max}`) + "<br/>" + comments

    const refs = same ? [ref_link(min_annotation)] : [ref_link(min_annotation), ref_link(max_annotation)]

    return { string, refs, data: { min, max } }
}


const virus_type_labels = new Set([
    labels.synthetic_specimen_virus_type_Naked_RNA,
    labels.synthetic_specimen_virus_type_Antigens,
    labels.synthetic_specimen_virus_type_Synthetic_Viral_Particles,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__Heat,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__Gammma,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__Chemical,
    labels.synthetic_specimen_virus_type_Inactivated_Virus__method_not_specified,
    labels.synthetic_specimen_virus_type_Live_Virus,
    labels.synthetic_specimen_virus_type_Partial_Live_Virus,
])
function synthetic_specimen__viral_material_value_handler (data_node: DATA_NODE): VALUE_FOR_CELL<{types: string[]}>
{
    const annotations = data_node.annotations

    const v = annotations.map(a => a.text).join("; ")
    const comments = comments_from_annotations(annotations)

    let string = ""
    let types: string[] = []
    if (annotations.length)
    {

        annotations.forEach(a => a.labels.forEach(label =>
        {
            if (virus_type_labels.has(label))
            {
                const parts = label.split("/")
                types.push(parts[parts.length - 1])
            }
        }))


        const type = types.length ? types.join(", ") : `<span style="color: #ccc;">not parsed</span>`

        string = type + " | " + v + "<br/>" + comments
    }

    return { string, refs: data_node.refs, data: { types } }
}


function link_value_handler (data_node: DATA_NODE): VALUE_FOR_CELL<{ value: string }>
{
    const anot8_org_file_id = data_node.data.value
    const pseudo_annotation = {
        anot8_org_file_id,
    }
    const refs = [ref_link(pseudo_annotation)]

    return { string: "", refs, data: { value: anot8_org_file_id } }
}


/** TypeScript version of python function */
function get_FDA_EUA_pdf_file_path_from_FDA_url (url)
{
    const matches = url.match(`https://www.fda.gov/media/(\\d+)/download`)
    let file_id = ""
    try
    {
        file_id = matches[1]
    }
    catch (e)
    {
        console.error("failed on url: ", url)
        throw e
    }
    const file_path = `FDA-EUA/PDFs/${file_id}.pdf`

    return file_path
}


const value_handlers: {[label: string]: VALUE_HANDLER<any>} = {
    [labels.claims__limit_of_detection__value]: lod_value_handler,
    [labels.test_descriptor__manufacturer_name]: data_value_handler,
    [labels.test_descriptor__test_name]: data_value_handler,
    [labels.test_technology]: data_value_handler,
    [labels.validation_condition__author]: data_value_handler,
    [labels.validation_condition__date]: data_value_handler,
    [labels.validation_condition__synthetic_specimen__viral_material]: synthetic_specimen__viral_material_value_handler,
    [labels._extra_url_to_IFU_or_EUA]: link_value_handler,
}


function create_table_cell_contents (data_node: DATA_NODE)
{
    const value_title = html_safe_ish(data_node.html_display_string)
    const value_el = document.createElement("div")
    value_el.className = "value_el"
    value_el.innerHTML = data_node.html_display_string
    value_el.title = value_title
    value_el.addEventListener("click", () =>
    {
        value_el.classList.toggle("expanded")
    })


    const ref_container_el = document.createElement("div")
    ref_container_el.innerHTML = data_node.refs.map(r => ` <a class="reference" href="${r}">R</a>`).join(" ")

    const cell_el = document.createElement("div")
    cell_el.appendChild(value_el)
    cell_el.appendChild(ref_container_el)

    return cell_el
}


function populate_table_body (headers: HEADERS, data_rows: DATA_ROW[])
{
    const table_el = document.getElementById("data_table")
    const tbody_el = table_el.getElementsByTagName("tbody")[0]

    data_rows.forEach(data_row =>
    {
        const row = tbody_el.insertRow()

        iterate_lowest_header(headers, (header: HEADER) =>
        {
            const cell = row.insertCell()
            cell.className = header.hidden ? "hidden" : ""
            const data_node: DATA_NODE = data_row[header.label]
            if (data_node)
            {
                const value_handler = value_handlers[header.label] || annotations_value_handler
                const value = value_handler(data_node)

                data_node.html_display_string = value.string
                data_node.refs = value.refs
                data_node.data = value.data

                const child_el = create_table_cell_contents(data_node)
                cell.appendChild(child_el)
            }
        })
    })

    // Complete hack: TODO remove this
    // Replacing with merge.py
    interface TempData
    {
        test_id: string
        developer_name: string
        test_name: string
        lod_min: number
        lod_max: number
        lod_units: string
        synthetic_specimen__viral_material: string
    }
    const data_for_export: TempData[] = []
    data_rows.forEach(data_row => {
        const lod = (data_row[labels.claims__limit_of_detection__value] || {}).data || {}
        const lod_units = ((data_row[labels.claims__limit_of_detection__units] || {}).data || {})
        const synthetic_specimen__viral_material = (data_row[labels.validation_condition__synthetic_specimen__viral_material] || {}).data || {}

        data_for_export.push({
            test_id: data_row.test_id as string,
            developer_name: data_row[labels.test_descriptor__manufacturer_name].data.value,
            test_name: data_row[labels.test_descriptor__test_name].data.value,
            lod_min: lod.min,
            lod_max: lod.max,
            lod_units: lod_units.value,
            synthetic_specimen__viral_material: synthetic_specimen__viral_material.types,
        })
    })

    //console.log(JSON.stringify(data_for_export, null, 2))
}


function update_progress ()
{
    const progress_el = document.getElementById("progress")

    const tbody = document.getElementsByTagName("tbody")[0]

    const total_rows = tbody.children.length
    let total_valid_rows = 0
    let total_completed = 0
    Array.from(tbody.children).forEach(row =>
        {
            total_valid_rows += ((row.children[3] as any).innerText.includes("Serology") ? 0 : 1)
            total_completed += ((row.children[4] as any).innerText !== "" ? 1 : 0)
        })

    const percentage = ((total_completed / total_rows) * 100).toFixed(1)
    progress_el.innerText = `${percentage}% ${total_completed}/${total_valid_rows}  (${total_rows})`
}


// DO NOT USE THIS IN PRODUCTION
function html_safe_ish (value)
{
    return value.replace(/(<([^>]+)>)/ig, "")
        .replace(/"/ig, `'`)
}


activate_options()
const used_annotation_labels = Array.from(get_used_annotation_labels(annotation_files_by_test_id))
report_on_unused_labels(used_annotation_labels)
let data_rows = reformat_fda_eua_parsed_data_as_rows(fda_eua_parsed_data)
data_rows.forEach(row => add_data_from_annotations(row, annotation_files_by_test_id, labels))
// temporarily filter out rows from
data_rows = data_rows.filter(d => {
    const tech = (d["Test technology"].data.value as string).toLowerCase()
    // Finds most of the them.
    const remove = tech.includes("serology") || tech.includes("igg") || tech.includes("igm")
    return !remove
})
build_header(headers)
populate_table_body(headers, data_rows)
update_progress()
