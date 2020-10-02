
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
interface ANNOTATIONS_BY_TEST_NAME
{
    [test_name: string]: AnnotationFile[]
}


declare var labels: {[label_id: number]: string}
declare var fda_eua_parsed_data: FDA_EUA_PARSED_DATA
declare var annotations_by_test_name: ANNOTATIONS_BY_TEST_NAME


enum DATA_KEYS {
    test_descriptor__manufacturer_name = "test_descriptor__manufacturer_name",
    test_descriptor__test_name = "test_descriptor__test_name",
    claims__controls__internal__human_gene_target = "claims__controls__internal__human_gene_target",
    claims__limit_of_detection__minimum_replicates = "claims__limit_of_detection__minimum_replicates",
    claims__limit_of_detection__value = "claims__limit_of_detection__value",
    claims__limit_of_detection__units = "claims__limit_of_detection__units",
    claims__primers_and_probes__sequences = "claims__primers_and_probes__sequences",
    claims__primers_and_probes__sources = "claims__primers_and_probes__sources",
    claims__reaction_volume_uL = "claims__reaction_volume_uL",
    claims__specimen__supported_types = "claims__supported_specimen_types",
    claims__specimen__transport_medium = "claims__specimen__transport_medium",
    claims__target_viral_genes = "claims__target_viral_genes",
    validation_condition__author = "validation_condition__author",
    validation_condition__comparator_test = "validation_condition__comparator_test",
    validation_condition__date = "validation_condition__date",
    validation_condition__sample_volume = "validation_condition__sample_volume",
    validation_condition__specimen_type = "validation_condition__specimen_type",
    validation_condition__swab_type = "validation_condition__swab_type",
    validation_condition__synthetic_specimen__clinical_matrix = "validation_condition__synthetic_specimen__clinical_matrix",
    validation_condition__synthetic_specimen__clinical_matrix_source = "validation_condition__synthetic_specimen__clinical_matrix_source",
    validation_condition__synthetic_specimen__viral_material = "validation_condition__synthetic_specimen__viral_material",
    validation_condition__synthetic_specimen__viral_material_source = "validation_condition__synthetic_specimen__viral_material_source",
    validation_condition__transport_medium = "validation_condition__transport_medium",
    metrics__num_clinical_samples__positive = "metrics__num_clinical_samples__positive",
    metrics__num_clinical_samples__negative_controls = "metrics__num_clinical_samples__negative_controls",
    metrics__confusion_matrix__true_positives = "metrics__confusion_matrix__true_positives",
    metrics__confusion_matrix__false_negatives = "metrics__confusion_matrix__false_negatives",
    metrics__confusion_matrix__true_negatives = "metrics__confusion_matrix__true_negatives",
    metrics__confusion_matrix__false_positives = "metrics__confusion_matrix__false_positives",
}
const MAP_DATA_KEY_TO_LABEL_ID = {
    [DATA_KEYS.claims__controls__internal__human_gene_target]: 83,
    [DATA_KEYS.claims__limit_of_detection__minimum_replicates]: 68,
    [DATA_KEYS.claims__limit_of_detection__value]: 66,
    [DATA_KEYS.claims__limit_of_detection__units]: 67,
    [DATA_KEYS.claims__primers_and_probes__sequences]: 78,
    [DATA_KEYS.claims__primers_and_probes__sources]: 79,
    [DATA_KEYS.claims__reaction_volume_uL]: 72,
    [DATA_KEYS.claims__specimen__supported_types]: 0,
    [DATA_KEYS.claims__specimen__transport_medium]: 34,
    [DATA_KEYS.claims__target_viral_genes]: 6,
    [DATA_KEYS.validation_condition__author]: 24,
    [DATA_KEYS.validation_condition__date]: 25,
    [DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix]: 64,
    [DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix_source]: 86,
    [DATA_KEYS.validation_condition__synthetic_specimen__viral_material]: 62,
    [DATA_KEYS.validation_condition__synthetic_specimen__viral_material_source]: 63,
}


function get_all_annotation_label_ids ()
{
    const all_annotation_label_ids = new Set<number>()

    ;(Object as any).values(annotations_by_test_name)
        .forEach((annotation_files: AnnotationFile[]) => {
            annotation_files.forEach(annotation_file =>
                {
                    annotation_file.annotations
                        .filter(is_annotation)
                        .forEach(annotation =>
                            {
                                annotation.labels.forEach(label =>
                                    {
                                        all_annotation_label_ids.add(label.id)
                                    })
                            })
                })
        })

    return all_annotation_label_ids
}
const all_annotation_label_ids = Array.from(get_all_annotation_label_ids())


// Report on unused labels

const LABEL_IDS_MAPPED_TO_DATA_KEY = new Set<number>((Object as any).values(MAP_DATA_KEY_TO_LABEL_ID))
const LABEL_ID__META__NOT_SPECIFIED = 73
const LABEL_ID__META__NOT_SPECIFIED__PARTIAL_INFO = 109
const LABEL_IDS__META__NOT_SPECIFIED = [
    LABEL_ID__META__NOT_SPECIFIED,
    LABEL_ID__META__NOT_SPECIFIED__PARTIAL_INFO,
]
const LABEL_ID__META__ERROR = 74
const LABEL_ID__META__POTENTIAL_ERROR = 99
const LABEL_IDS__META__ERRORS = [
    LABEL_ID__META__ERROR,
    LABEL_ID__META__POTENTIAL_ERROR,
]

const LABEL_IDS_HANDLED_ELSE_WHERE = [
    ...LABEL_IDS__META__NOT_SPECIFIED,
    ...LABEL_IDS__META__ERRORS,
]
LABEL_IDS_HANDLED_ELSE_WHERE.forEach(label_id => LABEL_IDS_MAPPED_TO_DATA_KEY.add(label_id))

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
LABEL_IDS_TO_SILENCE.forEach(label_id => LABEL_IDS_MAPPED_TO_DATA_KEY.add(label_id))

const unhandled_label_ids = all_annotation_label_ids.filter(x => !LABEL_IDS_MAPPED_TO_DATA_KEY.has(x))
console.log(`Unhandled label ids: ${unhandled_label_ids.map(id => `\n * ${id} -> ${labels[id]}`)}`)


interface DATA_NODE
{
    value: string
    comment?: string
    refs: string[]
    annotations: AnnotationWithFilePath[]
}
interface DATA_ROW
{
    test_descriptor__manufacturer_name: DATA_NODE,
    test_descriptor__test_name: DATA_NODE,
    validation_condition__author: DATA_NODE,
    validation_condition__date: DATA_NODE,
}


type DATA = DATA_ROW[]
function reformat_fda_eua_parsed_data (fda_eua_parsed_data: FDA_EUA_PARSED_DATA): DATA
{
    return fda_eua_parsed_data
    .slice(1) // skip first row of json array which contains csv-like array of headers
    .map(fda_eua_parsed_data_row =>
        {
            const test_name = fda_eua_parsed_data_row[2]
            const manufacturer_name = fda_eua_parsed_data_row[1]
            const date = fda_eua_parsed_data_row[0]

            const row: DATA_ROW = {
                test_descriptor__manufacturer_name: {
                    value: manufacturer_name,
                    refs: [],
                    annotations: [],
                },
                test_descriptor__test_name: {
                    value: test_name,
                    refs: [],
                    annotations: [],
                },
                validation_condition__author: {
                    value: "self",
                    refs: [],
                    annotations: [],
                },
                validation_condition__date: {
                    value: date,
                    refs: [],
                    annotations: [],
                },
            }

            return row
        })
}


function add_data_from_annotations (row: DATA_ROW, annotations_by_test_name: ANNOTATIONS_BY_TEST_NAME)
{
    const test_name = row[DATA_KEYS.test_descriptor__test_name].value

    const annotation_files = annotations_by_test_name[test_name]
    if (!annotation_files) return

    Object.keys(MAP_DATA_KEY_TO_LABEL_ID).forEach((data_key: DATA_KEYS) =>
        {
            const data_node = get_specific_annotations_data(data_key, annotation_files)
            row[data_key] = data_node
        })
}


function get_specific_annotations_data (data_key: DATA_KEYS, annotation_files: AnnotationFile[]): DATA_NODE
{
    const label_id = MAP_DATA_KEY_TO_LABEL_ID[data_key]
    const annotations = filter_annotation_files_for_label(annotation_files, label_id)

    let value = ""
    let refs = []
    let comments = ""

    if (annotations.length > 0)
    {
        value = value_from_annotations(annotations)
        refs = annotations.map(annotation => ref_link(annotation.relative_file_path, annotation.id))
        comments = comments_from_annotations(annotations)

        value = value + "<br/>" + comments
    }

    return { value, refs, annotations }
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


function value_from_annotations (annotations: AnnotationWithFilePath[]): string
{
    const WARNING_HTML_SYMBOL = `<span class="warning_symbol" title="Value not specified">⚠</span>`
    const ERROR_HTML_SYMBOL = `<span class="error_symbol" title="Potential error">⚠</span>`

    let includes_warning = false
    let includes_error = false

    let value = annotations.map(annotation => {
        let value = annotation.text

        if (annotation.labels.find(label => LABEL_IDS__META__NOT_SPECIFIED.includes(label.id)))
        {
            includes_warning = true
            let append_text = value ? value + " (not specified)" : "Not specified"
            value = `${WARNING_HTML_SYMBOL} ${append_text}`
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
    data_key: DATA_KEYS
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
        data_key: null,
        category: "test_descriptor",
        children: [
            {
                title: "Name",
                data_key: DATA_KEYS.test_descriptor__manufacturer_name,
            },
            {
                title: "Test name",
                data_key: DATA_KEYS.test_descriptor__test_name,
            },
        ],
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
                        data_key: DATA_KEYS.claims__specimen__supported_types,
                    },
                    {
                        title: "Transport medium",
                        data_key: DATA_KEYS.claims__specimen__transport_medium,
                    },
                ]
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Appropriate testing population",
                // e.g. * patients suspected of COVID-19 by a healthcare provider
                //      * pooled samples
                //      * general, asymptomatic screening population i.e. screening of individuals without symptoms or other reasons to suspect COVID-19
                data_key: null,
            },
            {
                // Not in May 13th version of FDA EUA template
                title: "Sample pooling",
                data_key: null,
                children: [
                    { title: "Approach", data_key: null, },
                    { title: "Max no. specimens", data_key: null, },
                ]
            },
            { title: "Target gene(s) of SARS-CoV-2", data_key: DATA_KEYS.claims__target_viral_genes, },
            {
                title: "Primers and probes",
                data_key: null,
                children: [
                    { title: "Sequences", data_key: DATA_KEYS.claims__primers_and_probes__sequences, },
                    { title: "Sources", data_key: DATA_KEYS.claims__primers_and_probes__sources, },
                ]
            },
            {
                title: "Test technology",
                // e.g. RT-qPCR
                data_key: null,
            },
            {
                // Not in May 13th version of FDA EUA template
                // i.e. can include more than just SARS-CoV-2
                title: "Detects pathogen(s)",
                data_key: null,
            },
            {
                title: "Limit of Detection (LOD)",
                data_key: null,
                children: [
                    {
                        title: "value",
                        data_key: DATA_KEYS.claims__limit_of_detection__value,
                    },
                    {
                        title: "units",
                        data_key: DATA_KEYS.claims__limit_of_detection__units,
                    },
                    {
                        title: "Minimum replicates",
                        data_key: DATA_KEYS.claims__limit_of_detection__minimum_replicates,
                    },
                ]
            },
            {
                title: "Intended user",
                // e.g. CLIA labs
                data_key: null,
            },
            { title: "Compatible equipment", data_key: null, },
            // {
                // Product Overview/Test Principle...
                //     // primer and probe sets and briefly describe what they detect. Please include the nucleic acid sequences for all primers and probes used in the test. Please indicate if the test uses biotin-Streptavidin/avidin chemistry
                // },
            {
                title: "Controls",
                data_key: null,
                children: [
                    { title: "Human gene", data_key: DATA_KEYS.claims__controls__internal__human_gene_target, },
                ]
            },
            {
                title: "RNA extraction",
                data_key: null,
                children: [
                    { title: "Specimen input volume", data_key: null, },
                    { title: "RNA extraction method(s)", data_key: null, },
                    { title: "Nucleic acid elution volume", data_key: null, },
                    { title: "Purification manual &/ automated", data_key: null, },
                ]
            },
            {
                title: "Reverse transcription",
                data_key: null,
                children: [
                    { title: "Input volume", data_key: null, },
                    { title: "Enzyme mix / kits", data_key: null, },
                ]
            },
            {
                title: "PCR / amplification",
                data_key: null,
                children: [
                    { title: "Instrument", data_key: null, },
                    { title: "Enzyme mix / kits", data_key: null, },
                    { title: "Reaction volume / μL", data_key: DATA_KEYS.claims__reaction_volume_uL, },
                ]
            },
            {
                title: "PCR quantification fluoresence detection",
                data_key: null,
                children: [
                    { title: "Instrument", data_key: null, },
                ]
            },
        ],
    },
    {
        title: "Validation conditions",
        data_key: null,
        category: "validation_condition",
        children: [
            {
                title: "Author",
                data_key: DATA_KEYS.validation_condition__author,
            },
            {
                title: "Date",
                data_key: DATA_KEYS.validation_condition__date,
            },
            {
                title: "Patient details",
                data_key: null,
                children: [
                    { title: "Age", data_key: null, },
                    { title: "Race", data_key: null, },
                    { title: "Gender", data_key: null, },
                ]
            },
            { title: "Disease stage", data_key: null, },
            {
                title: "Synthetic Specimen",
                data_key: null,
                children: [
                    { title: "Viral material", data_key: DATA_KEYS.validation_condition__synthetic_specimen__viral_material, },
                    { title: "Viral material source", data_key: DATA_KEYS.validation_condition__synthetic_specimen__viral_material_source, },
                    { title: "Clinical matrix", data_key: DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix, },
                    { title: "Clinical matrix source", data_key: DATA_KEYS.validation_condition__synthetic_specimen__clinical_matrix_source, },
                ]
            },
            {
                title: "Specimen",
                data_key: null,
                children: [
                    { title: "Type", data_key: DATA_KEYS.validation_condition__specimen_type, },
                    { title: "Swab type", data_key: DATA_KEYS.validation_condition__swab_type, },
                    { title: "Transport medium", data_key: DATA_KEYS.validation_condition__transport_medium, },
                    { title: "Sample volume", data_key: DATA_KEYS.validation_condition__sample_volume, },
                ]
            },
        ],
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
                        data_key: DATA_KEYS.metrics__num_clinical_samples__positive,
                    },
                    {
                        title: "Controls (negatives)",
                        data_key: DATA_KEYS.metrics__num_clinical_samples__negative_controls,
                    },
                ]
            },
            {
                title: "Comparator test",
                data_key: DATA_KEYS.validation_condition__comparator_test,
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
        ],
    },
    {
        title: "Derived values",
        data_key: null,
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


function populate_table_body (headers: HEADERS, data: DATA)
{
    const table_el = document.getElementById("data_table")
    const tbody_el = table_el.getElementsByTagName("tbody")[0]

    data.forEach(data_row =>
    {
        const row = tbody_el.insertRow()

        iterate_lowest_header(headers, (header: HEADER) =>
        {
            const cell = row.insertCell()
            if (header.data_key !== null && data_row[header.data_key])
            {
                const data_node: DATA_NODE = data_row[header.data_key]

                const value = data_node.value.toString()
                const value_title = html_safe_ish(value)
                const value_el = document.createElement("div")
                value_el.className = "value_el"
                value_el.innerHTML = value
                value_el.title = value_title
                value_el.addEventListener("click", () =>
                {
                    value_el.classList.toggle("expanded")
                })

                cell.appendChild(value_el)

                const ref_container_el = document.createElement("div")
                const refs = data_node.refs
                ref_container_el.innerHTML = refs.map(r => ` <a class="reference" href="${r}">R</a>`).join(" ")

                cell.appendChild(ref_container_el)
            }
        })
    })
}


function update_progress ()
{
    const progress_el = document.getElementById("progress")

    const tbody = document.getElementsByTagName("tbody")[0]
    const total_rows = tbody.children.length
    let total_completed = 0
    Array.from(tbody.children).forEach(row =>
        {
            total_completed += (row.children[2].innerHTML !== "" ? 1 : 0)
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
const extracted_data = reformat_fda_eua_parsed_data(fda_eua_parsed_data)
extracted_data.forEach(row => add_data_from_annotations(row, annotations_by_test_name))
build_header(headers)
populate_table_body(headers, extracted_data)
update_progress()
