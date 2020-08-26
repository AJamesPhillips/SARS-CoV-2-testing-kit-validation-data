var _a;
var DATA_KEYS;
(function (DATA_KEYS) {
    DATA_KEYS["test_descriptor__manufacturer_name"] = "test_descriptor__manufacturer_name";
    DATA_KEYS["test_descriptor__test_name"] = "test_descriptor__test_name";
    DATA_KEYS["validation_condition__author"] = "validation_condition__author";
    DATA_KEYS["validation_condition__date"] = "validation_condition__date";
    DATA_KEYS["metrics__num_clinical_samples__positive"] = "metrics__num_clinical_samples__positive";
    DATA_KEYS["metrics__num_clinical_samples__negative_controls"] = "metrics__num_clinical_samples__negative_controls";
})(DATA_KEYS || (DATA_KEYS = {}));
var data = [
    (_a = {},
        _a[DATA_KEYS.test_descriptor__manufacturer_name] = { value: "", refs: [] },
        _a[DATA_KEYS.test_descriptor__test_name] = { value: "ePlex SARS-CoV-2 Test", refs: [] },
        _a[DATA_KEYS.validation_condition__author] = { value: "self", refs: [] },
        _a[DATA_KEYS.validation_condition__date] = { value: "", refs: [] },
        _a[DATA_KEYS.metrics__num_clinical_samples__positive] = {
            value: 18,
            refs: [
                "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2FFDA-EUA%2FPDFs%2F136282.pdf&highlighted_annotation_ids=8"
            ]
        },
        _a[DATA_KEYS.metrics__num_clinical_samples__negative_controls] = {
            value: 47,
            refs: [
                "http://localhost:5003/render_pdf?relative_file_path=..%2F..%2Fdata%2FFDA-EUA%2FPDFs%2F136282.pdf&highlighted_annotation_ids=9"
            ]
        },
        _a)
];
// Merge with FDA_EUA_PARSED_DATA
var FDA_EUA_PARSED_DATA_BY_TEST_NAME = fda_eua_parsed_data.reduce(function (accum, row) {
    var _a;
    var test_name = row[2];
    if (accum[test_name]) {
        console.error("Duplicate test_name in fda_eua_parsed_data: " + test_name);
    }
    else {
        accum[test_name] = (_a = {},
            _a[DATA_KEYS.test_descriptor__manufacturer_name] = row[1],
            _a[DATA_KEYS.validation_condition__date] = row[0],
            _a);
    }
    return accum;
}, {});
data.forEach(function (row) {
    var test_name = row[DATA_KEYS.test_descriptor__test_name].value;
    var fda_eua = FDA_EUA_PARSED_DATA_BY_TEST_NAME[test_name];
    if (fda_eua) {
        row[DATA_KEYS.test_descriptor__manufacturer_name] =
            {
                value: fda_eua[DATA_KEYS.test_descriptor__manufacturer_name],
                refs: []
            };
        // Will likely delete this as EUA date is not the same as
        // validation date if more recent data is given
        var author = row[DATA_KEYS.validation_condition__author];
        if (author && author.value === "self") {
            row[DATA_KEYS.validation_condition__date] =
                {
                    value: fda_eua[DATA_KEYS.validation_condition__date],
                    refs: []
                };
        }
    }
    else {
        console.error("test_name not present in fda_eua_parsed_data: " + test_name);
    }
});
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
            { title: "Supported specimen types", data_key: null },
            {
                // Not in May 13th version
                title: "Appropriate testing population",
                // e.g. * patients suspected of COVID-19 by a healthcare provider
                //      * pooled samples
                //      * general, asymptomatic screening population i.e. screening of individuals without symptoms or other reasons to suspect COVID-19
                data_key: null
            },
            {
                // Not in May 13th version
                title: "Sample pooling",
                data_key: null,
                children: [
                    { title: "Approach", data_key: null },
                    { title: "Max no. specimens", data_key: null },
                ]
            },
            { title: "Target gene(s) of SARS-CoV-2", data_key: null },
            {
                title: "Test technology",
                // e.g. RT-qPCR
                data_key: null
            },
            {
                // Not in May 13th version
                title: "Detects pathogen(s)", data_key: null
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
            { title: "Specimen type", data_key: null },
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
        ]
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
            if (header.data_key !== null) {
                var value = data_row[header.data_key].value.toString();
                cell.innerHTML = value;
                var refs = data_row[header.data_key].refs;
                cell.innerHTML += refs.map(function (r) { return " <a class=\"reference\" href=\"" + r + "\">R</a>"; }).join(" ");
            }
        });
    });
}
build_header(headers);
populate_table_body(headers, data);
