var headers = [
    {
        title: "Manufacturer",
        data_index: null,
        category: "test_descriptor",
        children: [
            { title: "Name", data_index: 1 },
            { title: "Test name", data_index: 2 },
        ]
    },
    {
        title: "Claims",
        data_index: null,
        category: "test_claims",
        children: [
            { title: "Supported specimen types", data_index: null },
            { title: "Appropriate testing population", data_index: null },
            {
                title: "Sample pooling",
                data_index: null,
                children: [
                    { title: "Approach", data_index: null },
                    { title: "Max no. specimens", data_index: null },
                ]
            },
            { title: "Test technology", data_index: null },
            { title: "Detects pathogen(s)", data_index: null },
            { title: "Intended user", data_index: null },
            { title: "Compatible equipment", data_index: null },
            {
                title: "RNA extraction",
                data_index: null,
                children: [
                    { title: "Specimen input volume", data_index: null },
                    { title: "RNA extraction method(s)", data_index: null },
                    { title: "Nucleic acid elution volume", data_index: null },
                    { title: "Purification manual &/ automated", data_index: null },
                ]
            },
            {
                title: "Reverse transcription",
                data_index: null,
                children: [
                    { title: "Input volume", data_index: null },
                    { title: "Enzyme mix / kits", data_index: null },
                ]
            },
            {
                title: "PCR / amplification",
                data_index: null,
                children: [
                    { title: "Instrument", data_index: null },
                    { title: "Enzyme mix / kits", data_index: null },
                ]
            }
        ]
    },
    {
        title: "Validation conditions",
        data_index: null,
        category: "validation_condition",
        children: [
            { title: "Author", data_index: null },
            { title: "Date", data_index: 0 },
            { title: "Specimen type", data_index: null },
            {
                title: "Patient details",
                data_index: null,
                children: [
                    { title: "Age", data_index: null },
                    { title: "Race", data_index: null },
                    { title: "Gender", data_index: null },
                ]
            },
            { title: "Disease stage", data_index: null },
        ]
    },
    {
        title: "Overall score",
        data_index: null,
        category: "metric"
    },
    {
        title: "Metrics",
        data_index: null,
        category: "metric",
        children: [
            {
                title: "Number of clinical samples",
                data_index: null,
                children: [
                    { title: "Positives", data_index: null },
                    { title: "Controls (negatives)", data_index: null },
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
    data.slice(1).forEach(function (data_row) {
        var row = tbody_el.insertRow();
        iterate_lowest_header(headers, function (header) {
            var cell = row.insertCell();
            if (header.data_index !== null) {
                var value = data_row[header.data_index];
                cell.innerHTML = Array.isArray(value) ? value.join("; ") : value;
            }
        });
    });
}
build_header(headers);
populate_table_body(headers, data);
