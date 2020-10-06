
interface LABEL_IDS_TO_NAMES
{
    [label_id: number]: string
}


type FDA_EUA_PARSED_DATA_ROW = [
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
    string,
]
type FDA_EUA_PARSED_DATA = FDA_EUA_PARSED_DATA_ROW[]


interface Label
{
    id: number
    text: string
}

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
    labels: Label[]
    comment: string
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

interface AnnotationWithFilePath extends Annotation
{
    relative_file_path: string
}
interface AnnotationFile
{
    version: number
    relative_file_path: string
    file_sha1_hash: string
    annotations: AnnotationEntry[]
    comments: string[]
}
interface ANNOTATION_FILES_BY_TEST_NAME
{
    [test_name: string]: AnnotationFile[]
}


declare var label_ids_to_names: LABEL_IDS_TO_NAMES
declare var fda_eua_parsed_data: FDA_EUA_PARSED_DATA
declare var annotation_files_by_test_name: ANNOTATION_FILES_BY_TEST_NAME


const labels = {
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
    test_descriptor__manufacturer_name: 111,
    test_descriptor__test_name: 110,
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
}
type LABELS = typeof labels

const LABEL_IDS__META__NOT_SPECIFIED = [
    labels.meta__not_specified,
    labels.meta__not_specified__partial_info,
]
const LABEL_IDS__META__ERRORS = [
    labels.meta__error,
    labels.meta__potential_error,
]
const LABEL_IDS__META = [
    ...LABEL_IDS__META__NOT_SPECIFIED,
    ...LABEL_IDS__META__ERRORS,
]

function get_used_annotation_label_ids (annotation_files_by_test_name: ANNOTATION_FILES_BY_TEST_NAME)
{
    const used_annotation_label_ids = new Set<number>()

    ;(Object as any).values(annotation_files_by_test_name)
        .forEach((annotation_files: AnnotationFile[]) => {
            annotation_files.forEach(annotation_file =>
                {
                    annotation_file.annotations
                        .filter(is_annotation)
                        .forEach(annotation =>
                            {
                                annotation.labels.forEach(label =>
                                    {
                                        used_annotation_label_ids.add(label.id)
                                    })
                            })
                })
        })

    return used_annotation_label_ids
}


// Report on unused labels
function report_on_unused_labels (label_ids_to_names: LABEL_IDS_TO_NAMES, used_annotation_label_ids: number[])
{
    const HANDLED_LABEL_IDS = new Set<number>((Object as any).values(labels))

    const LABEL_IDS_HANDLED_ELSE_WHERE = LABEL_IDS__META
    LABEL_IDS_HANDLED_ELSE_WHERE.forEach(label_id => HANDLED_LABEL_IDS.add(label_id))

    const LABEL_IDS_TO_SILENCE = [
        70, // -> Limit of Detection (LOD)/Concentration Range/Number of steps,
        71, // -> Limit of Detection (LOD)/Concentration Range/Dilution per step,
        84, // -> Controls/Internal/Extraction control material/Description,
        85, // -> Controls/Internal/Extraction control material/Source,
        // 86, // -> Specimen/Synthetic Specimen/Clinical matrix/Source,
        87, // -> Potential interfering substances,
        88, // -> Potential interfering substances/Test synthetic sample,
        75, // -> Specimen/Collection protocol,
        89, // -> Time to test result in minutes,
        90, // -> Meta/Question to answer,
        96, // -> Statistics/Confidence intervals/Percentage,
        98, // -> Statistics/Confidence intervals/Lower value,
        97, // -> Statistics/Confidence intervals/Upper value,
        100, // -> Meta/Error/Omission,
        82, // -> Controls/Internal,
        101, // -> Specimen/Synthetic Specimen/Other components,
        102, // -> Specimen/Synthetic Specimen/Production method
    ]
    LABEL_IDS_TO_SILENCE.forEach(label_id => HANDLED_LABEL_IDS.add(label_id))

    const unhandled_label_ids = used_annotation_label_ids.filter(x => !HANDLED_LABEL_IDS.has(x))
    console.log(`Unhandled label ids: ${unhandled_label_ids.map(id => `\n * ${id} -> ${label_ids_to_names[id]}`)}`)
}


interface DATA_NODE
{
    value: string
    comment?: string
    annotations: AnnotationWithFilePath[]

    // Other fields added during rendering
    // TODO: remove this complete hack
    string?: string
    refs?: string[]
    data?: any
}
interface DATA_ROW
{
    [label_id: number]: DATA_NODE
}


function reformat_fda_eua_parsed_data_as_rows (fda_eua_parsed_data: FDA_EUA_PARSED_DATA): DATA_ROW[]
{
    return fda_eua_parsed_data
    .slice(1) // skip first row of json array which contains csv-like array of headers
    .map(fda_eua_parsed_data_row =>
        {
            const test_name = fda_eua_parsed_data_row[2]
            const manufacturer_name = fda_eua_parsed_data_row[1]
            const date = fda_eua_parsed_data_row[0]

            const row: DATA_ROW = {
                [labels.test_descriptor__manufacturer_name]: {
                    value: manufacturer_name,
                    annotations: [],
                },
                [labels.test_descriptor__test_name]: {
                    value: test_name,
                    annotations: [],
                },
                [labels.validation_condition__author]: {
                    value: "self",
                    annotations: [],
                },
                [labels.validation_condition__date]: {
                    value: date,
                    annotations: [],
                },
            }

            return row
        })
}


function add_data_from_annotations (row: DATA_ROW, annotation_files_by_test_name: ANNOTATION_FILES_BY_TEST_NAME, labels: LABELS)
{
    const test_name = row[labels.test_descriptor__test_name].value

    const annotation_files = annotation_files_by_test_name[test_name]
    if (!annotation_files) return

    ;(Object as any).values(labels).forEach((label_id: number) =>
        {
            if (row[label_id]) return // hack to avoid overwriting fields already set from parse FDA EUA data

            const data_node = get_specific_annotations_data(label_id, annotation_files)
            row[label_id] = data_node
        })
}


function get_specific_annotations_data (label_id: number, annotation_files: AnnotationFile[]): DATA_NODE
{
    const annotations = filter_annotation_files_for_label(annotation_files, label_id)

    let value = ""
    let comments = ""

    if (annotations.length > 0)
    {
        value = value_from_annotations(annotations)
        comments = comments_from_annotations(annotations)

        value = value + "<br/>" + comments
    }

    return { value, annotations }
}


function filter_annotation_files_for_label (annotation_files: AnnotationFile[], label_id: number): AnnotationWithFilePath[]
{
    let annotations: AnnotationWithFilePath[] = []
    annotation_files.forEach(annotation_file =>
        {
            annotations = [...annotations, ...filter_annotations_for_label(annotation_file, label_id)]
        })

    return annotations
}


function filter_annotations_for_label (annotation_file: AnnotationFile, label_id: number): AnnotationWithFilePath[]
{
    return annotation_file.annotations
        .filter(is_annotation)
        .filter(annotation =>
            {
                return annotation.labels.filter(label => label.id === label_id).length
            })
        .map(annotation =>
            ({
              ...annotation,
              relative_file_path: annotation_file.relative_file_path,
            }))
}


const WARNING_HTML_SYMBOL = `<span class="warning_symbol" title="Value not specified">⚠</span>`
const ERROR_HTML_SYMBOL = `<span class="error_symbol" title="Potential error">⚠</span>`
function not_specified_value_html (value: string)
{
    const append_text = value ? value + " (not specified)" : "Not specified"
    return `${WARNING_HTML_SYMBOL} ${append_text}`
}


function value_from_annotations (annotations: AnnotationWithFilePath[]): string
{
    let includes_warning = false
    let includes_error = false

    let value = annotations.map(annotation => {
        let value = annotation.text

        if (annotation.labels.find(label => LABEL_IDS__META__NOT_SPECIFIED.includes(label.id)))
        {
            includes_warning = true
            value = not_specified_value_html(value)
        }

        if (annotation.labels.find(label => LABEL_IDS__META__ERRORS.includes(label.id)))
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


function comments_from_annotations (annotations: AnnotationWithFilePath[]): string
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


function ref_link (relative_file_path: string, annotation_id?: number)
{
    let ref = `http://localhost:5003/render_pdf?relative_file_path=${relative_file_path}`

    if (annotation_id !== undefined) ref += `&highlighted_annotation_ids=${annotation_id}`

    return ref
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
    label_id: number
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
        label_id: null,
        category: "test_descriptor",
        children: [
            {
                title: "Name",
                label_id: labels.test_descriptor__manufacturer_name,
            },
            {
                title: "Test name",
                label_id: labels.test_descriptor__test_name,
            },
        ],
    },
    {
        title: "Claims",
        label_id: null,
        category: "test_claims",
        children: [
            {
                title: "Specimens",
                label_id: null,
                children: [
                    {
                        title: "Supported specimen types",
                        label_id: labels.claims__specimen__supported_types,
                    },
                    {
                        title: "Transport medium",
                        label_id: labels.claims__specimen__transport_medium,
                    },
                ]
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Appropriate testing population",
                // e.g. * patients suspected of COVID-19 by a healthcare provider
                //      * pooled samples
                //      * general, asymptomatic screening population i.e. screening of individuals without symptoms or other reasons to suspect COVID-19
                label_id: null,
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Sample pooling",
                label_id: null,
                children: [
                    { title: "Approach", label_id: null, },
                    { title: "Max no. specimens", label_id: null, },
                ]
            },
            { title: "Target gene(s) of SARS-CoV-2", label_id: labels.claims__target_viral_genes, },
            {
                title: "Primers and probes",
                label_id: null,
                children: [
                    { title: "Sequences", label_id: labels.claims__primers_and_probes__sequences, },
                    { title: "Sources", label_id: labels.claims__primers_and_probes__sources, },
                ]
            },
            {
                title: "Test technology",
                // e.g. RT-qPCR
                label_id: null,
            },
            {
                // Not in May 13th version of FDA EUA template
                // i.e. can include more than just SARS-CoV-2
                title: "Detects pathogen(s)",
                label_id: null,
            },
            {
                title: "Limit of Detection (LOD)",
                label_id: null,
                children: [
                    {
                        title: "value",
                        label_id: labels.claims__limit_of_detection__value,
                    },
                    {
                        title: "units",
                        label_id: labels.claims__limit_of_detection__units,
                    },
                    {
                        title: "Minimum replicates",
                        label_id: labels.claims__limit_of_detection__minimum_replicates,
                    },
                ]
            },
            {
                title: "Intended user",
                // e.g. CLIA labs
                label_id: null,
            },
            { title: "Compatible equipment", label_id: null, },
            // {
                // Product Overview/Test Principle...
                //     // primer and probe sets and briefly describe what they detect. Please include the nucleic acid sequences for all primers and probes used in the test. Please indicate if the test uses biotin-Streptavidin/avidin chemistry
                // },
            {
                title: "Controls",
                label_id: null,
                children: [
                    { title: "Human gene", label_id: labels.claims__controls__internal__human_gene_target, },
                ]
            },
            {
                title: "RNA extraction",
                label_id: null,
                children: [
                    { title: "Specimen input volume", label_id: null, },
                    { title: "RNA extraction method(s)", label_id: null, },
                    { title: "Nucleic acid elution volume", label_id: null, },
                    { title: "Purification manual &/ automated", label_id: null, },
                ]
            },
            {
                title: "Reverse transcription",
                label_id: null,
                children: [
                    { title: "Input volume", label_id: null, },
                    { title: "Enzyme mix / kits", label_id: null, },
                ]
            },
            {
                title: "PCR / amplification",
                label_id: null,
                children: [
                    { title: "Instrument", label_id: null, },
                    { title: "Enzyme mix / kits", label_id: null, },
                    { title: "Reaction volume / μL", label_id: labels.claims__reaction_volume_uL, },
                ]
            },
            {
                title: "PCR quantification fluoresence detection",
                label_id: null,
                children: [
                    { title: "Instrument", label_id: null, },
                ]
            },
        ],
    },
    {
        title: "Validation conditions",
        label_id: null,
        category: "validation_condition",
        children: [
            {
                title: "Author",
                label_id: labels.validation_condition__author,
            },
            {
                title: "Date",
                label_id: labels.validation_condition__date,
            },
            {
                title: "Patient details",
                label_id: null,
                children: [
                    { title: "Age", label_id: null, },
                    { title: "Race", label_id: null, },
                    { title: "Gender", label_id: null, },
                ]
            },
            { title: "Disease stage", label_id: null, },
            {
                title: "Synthetic Specimen",
                label_id: null,
                children: [
                    { title: "Viral material", label_id:labels.validation_condition__synthetic_specimen__viral_material, },
                    { title: "Viral material source", label_id:labels.validation_condition__synthetic_specimen__viral_material_source, },
                    { title: "Clinical matrix", label_id:labels.validation_condition__synthetic_specimen__clinical_matrix, },
                    { title: "Clinical matrix source", label_id:labels.validation_condition__synthetic_specimen__clinical_matrix_source, },
                ]
            },
            {
                title: "Specimen",
                label_id: null,
                children: [
                    { title: "Type", label_id: labels.validation_condition__specimen_type, },
                    { title: "Swab type", label_id: labels.validation_condition__swab_type, },
                    { title: "Transport medium", label_id: labels.validation_condition__transport_medium, },
                    { title: "Sample volume", label_id: labels.validation_condition__sample_volume, },
                ]
            },
        ],
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
                        label_id: labels.metrics__num_clinical_samples__positive,
                    },
                    {
                        title: "Controls (negatives)",
                        label_id: labels.metrics__num_clinical_samples__negative_controls,
                    },
                ]
            },
            {
                title: "Comparator test",
                label_id: labels.validation_condition__comparator_test,
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
        ],
    },
    {
        title: "Derived values",
        label_id: null,
        category: "derived_values",
        children: [],
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
            row1_width = 1
            row1_height = 3
        }
        else for (let i2 = 0; i2 < element1.children.length; ++i2)
        {
            const element2 = element1.children[i2]

            let row2_width = 0
            let row2_height = 1
            if (!(element2.children && element2.children.length))
            {
                row2_width = 1
                row2_height = 2
            }
            else for (let i3 = 0; i3 < element2.children.length; ++i3)
            {
                const element3 = element2.children[i3]
                row2_width++

                const cell3 = document.createElement("th")
                row3.appendChild(cell3)
                cell3.innerHTML = element3.title
                cell3.className = className
            }

            const cell2 = document.createElement("th")
            row2.appendChild(cell2)
            cell2.innerHTML = element2.title
            cell2.colSpan = row2_width
            cell2.rowSpan = row2_height
            cell2.className = className

            row1_width += row2_width
        }

        const cell1 = document.createElement("th")
        row1.appendChild(cell1)
        cell1.innerHTML = element1.title
        cell1.colSpan = row1_width
        cell1.rowSpan = row1_height
        cell1.className = className
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


function has_only_subset_of_labels(labels: Label[], allowed_subset_ids: number[])
{
    const allowed = new Set(allowed_subset_ids)
    return labels.filter(label => !allowed.has(label.id)).length === 0
}


interface VALUE_FOR_CELL <D> { string: string, refs: string[], data?: D }
type VALUE_HANDLER<D> = (data_node: DATA_NODE) => VALUE_FOR_CELL<D>

function default_value_handler (data_node: DATA_NODE): VALUE_FOR_CELL<undefined>
{
    const refs = data_node.annotations.map(annotation => ref_link(annotation.relative_file_path, annotation.id))
    return { string: data_node.value.toString(), refs }
}

const lod_allowed_label_ids = [ labels.claims__limit_of_detection__value, ...LABEL_IDS__META ]
type lod_value_data = { min: number, max: number } | { not_specified: true }
function limit_of_detection_value_handler (data_node: DATA_NODE): VALUE_FOR_CELL<lod_value_data>
{
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    let min_ref
    let max_ref

    data_node.annotations
        .forEach(annotation =>
            {
                if (has_only_subset_of_labels(annotation.labels, lod_allowed_label_ids))
                {
                    const v = parseFloat(annotation.text)
                    const new_min = Math.min(min, v)
                    const new_max = Math.max(max, v)

                    const ref = ref_link(annotation.relative_file_path, annotation.id)

                    if (new_min !== min)
                    {
                        min = new_min
                        min_ref = ref
                    }

                    if (new_max !== max)
                    {
                        max = new_max
                        max_ref = ref
                    }
                }
            })

    if (!min_ref)
    {
        return {
            string: not_specified_value_html(""),
            refs: [],
            data: { not_specified: true },
        }
    }

    const same = min === max
    const string = same ? `${min}` : `${min} <-> ${max}`
    const refs = same ? [min_ref] : [min_ref, max_ref]

    return { string, refs, data: { min, max } }
}

const value_handlers: {[label_id: number]: VALUE_HANDLER<any>} = {
    [labels.claims__limit_of_detection__value]: limit_of_detection_value_handler
}


function create_table_cell_contents (value: string, refs: string[])
{
    const value_title = html_safe_ish(value)
    const value_el = document.createElement("div")
    value_el.className = "value_el"
    value_el.innerHTML = value
    value_el.title = value_title
    value_el.addEventListener("click", () =>
    {
        value_el.classList.toggle("expanded")
    })


    const ref_container_el = document.createElement("div")
    ref_container_el.innerHTML = refs.map(r => ` <a class="reference" href="${r}">R</a>`).join(" ")

    return [value_el, ref_container_el]
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
            const data_node: DATA_NODE = data_row[header.label_id]
            if (data_node && data_node.value)
            {
                const value_handler = value_handlers[header.label_id] || default_value_handler
                const value = value_handler(data_node)

                data_node.string = value.string
                data_node.refs = value.refs
                data_node.data = value.data

                const children = create_table_cell_contents(value.string, value.refs)
                children.forEach(child_el => cell.appendChild(child_el))
            }
        })
    })

    // Complete hack: TODO remove this
    interface TempData
    {
        developer_name: string
        test_name: string
        lod_min: number
        lod_max: number
        lod_units: string
    }
    const data_for_export: TempData[] = []
    data_rows.forEach(data_row => {
        const lod = data_row[labels.claims__limit_of_detection__value].data || {}
        data_for_export.push({
            developer_name: data_row[labels.test_descriptor__manufacturer_name].value,
            test_name: data_row[labels.test_descriptor__test_name].value,
            lod_min: lod.min,
            lod_max: lod.max,
            lod_units: data_row[labels.claims__limit_of_detection__units].value,
        })
    })

    console.log(JSON.stringify(data_for_export, null, 2))
}


function update_progress ()
{
    const progress_el = document.getElementById("progress")

    const tbody = document.getElementsByTagName("tbody")[0]
    const total_rows = tbody.children.length
    let total_completed = 0
    Array.from(tbody.children).forEach(row =>
        {
            total_completed += ((row.children[2] as any).innerText !== "" ? 1 : 0)
        })

    const percentage = ((total_completed / total_rows) * 100).toFixed(1)
    progress_el.innerText = `${percentage}% ${total_completed}/${total_rows}`
}


// DO NOT USE THIS IN PRODUCTION
function html_safe_ish (value)
{
    return value.replace(/(<([^>]+)>)/ig, "")
        .replace(/"/ig, `'`)
}


activate_options()
const used_annotation_label_ids = Array.from(get_used_annotation_label_ids(annotation_files_by_test_name))
report_on_unused_labels(label_ids_to_names, used_annotation_label_ids)
const data_rows = reformat_fda_eua_parsed_data_as_rows(fda_eua_parsed_data)
data_rows.forEach(row => add_data_from_annotations(row, annotation_files_by_test_name, labels))
build_header(headers)
populate_table_body(headers, data_rows)
update_progress()
