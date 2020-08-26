
type FDA_EUA_PARSED_DATA = (string|null|string[])[][]
declare var fda_eua_parsed_data: FDA_EUA_PARSED_DATA

enum DATA_KEYS {
    test_descriptor__manufacturer_name = "test_descriptor__manufacturer_name",
    test_descriptor__test_name = "test_descriptor__test_name",
    validation_condition__author = "validation_condition__author",
    validation_condition__date = "validation_condition__date",
    metrics__num_clinical_samples__positive = "metrics__num_clinical_samples__positive",
    metrics__num_clinical_samples__negative_controls = "metrics__num_clinical_samples__negative_controls",
}


// const DATA: {[K in keyof typeof DATA_KEYS]: { value: string | number }}[] = [
interface DATA_NODE
{
    value: string | number
    refs: string[]
}
interface DATA_ROW
{
    test_descriptor__manufacturer_name: DATA_NODE,
    test_descriptor__test_name: DATA_NODE,
    validation_condition__author: DATA_NODE,
    validation_condition__date: DATA_NODE,
    metrics__num_clinical_samples__positive: DATA_NODE,
    metrics__num_clinical_samples__negative_controls: DATA_NODE,
}
type DATA = DATA_ROW[]
const data: DATA = [
    {
        [DATA_KEYS.test_descriptor__manufacturer_name]: { value: "", refs: [] },
        [DATA_KEYS.test_descriptor__test_name]: { value: "ePlex SARS-CoV-2 Test", refs: [] },
        [DATA_KEYS.validation_condition__author]: { value: "self", refs: [] },
        [DATA_KEYS.validation_condition__date]: { value: "", refs: [] },
        [DATA_KEYS.metrics__num_clinical_samples__positive]: {
            value: 18,
            refs: [
                "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2FFDA-EUA%2FPDFs%2F136282.pdf&highlighted_annotation_ids=8"
            ]
        },
        [DATA_KEYS.metrics__num_clinical_samples__negative_controls]: {
            value: 47,
            refs: [
                "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2FFDA-EUA%2FPDFs%2F136282.pdf&highlighted_annotation_ids=9"
            ]
        },
    }
]


// Merge with FDA_EUA_PARSED_DATA
const FDA_EUA_PARSED_DATA_BY_TEST_NAME = fda_eua_parsed_data.reduce((accum, row) => {
    const test_name = row[2] as string
    if (accum[test_name])
    {
        console.error(`Duplicate test_name in fda_eua_parsed_data: ${test_name}`)
    }
    else
    {
        accum[test_name] =
        {
            [DATA_KEYS.test_descriptor__manufacturer_name]: row[1],
            [DATA_KEYS.validation_condition__date]: row[0],
        }
    }

    return accum
}, {})

data.forEach(row =>
{
    const test_name = row[DATA_KEYS.test_descriptor__test_name].value
    const fda_eua = FDA_EUA_PARSED_DATA_BY_TEST_NAME[test_name]
    if (fda_eua)
    {
        row[DATA_KEYS.test_descriptor__manufacturer_name] =
        {
            value: fda_eua[DATA_KEYS.test_descriptor__manufacturer_name],
            refs: [],
        }

        // Will likely delete this as EUA date is not the same as
        // validation date if more recent data is given
        const author = row[DATA_KEYS.validation_condition__author]
        if (author && author.value === "self")
        {
            row[DATA_KEYS.validation_condition__date] =
            {
                value: fda_eua[DATA_KEYS.validation_condition__date],
                refs: [],
            }
        }
    }
    else
    {
        console.error(`test_name not present in fda_eua_parsed_data: ${test_name}`)
    }
})



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
            { title: "Supported specimen types", data_key: null, },
            {
                // Not in May 13th version
                title: "Appropriate testing population",
                // e.g. * patients suspected of COVID-19 by a healthcare provider
                //      * pooled samples
                //      * general, asymptomatic screening population i.e. screening of individuals without symptoms or other reasons to suspect COVID-19
                data_key: null,
            },
            {
                // Not in May 13th version
                title: "Sample pooling",
                data_key: null,
                children: [
                    { title: "Approach", data_key: null, },
                    { title: "Max no. specimens", data_key: null, },
                ]
            },
            { title: "Target gene(s) of SARS-CoV-2", data_key: null, },
            {
                title: "Test technology",
                // e.g. RT-qPCR
                data_key: null,
            },
            {
                // Not in May 13th version
                title: "Detects pathogen(s)", data_key: null,
                // i.e. can include more than just SARS-CoV-2
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
            { title: "Specimen type", data_key: null, },
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
        ],
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
            if (header.data_key !== null)
            {
                const value = data_row[header.data_key].value.toString()
                cell.innerHTML = value
                const refs = data_row[header.data_key].refs
                cell.innerHTML += refs.map(r => ` <a class="reference" href="${r}">R</a>`).join(" ")
            }
        })
    })
}


build_header(headers)
populate_table_body(headers, data)
