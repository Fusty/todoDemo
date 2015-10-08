function onEdit(event) {
    Logger.log("Saw an edit on "+ new Date());
    findRowsToProcess();
}

function findRowsToProcess(){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('todo');

    //Process all rows with a set task
    var taskValues = sheet.getRange("B1:B").getValues();
    var lastRow = taskValues.filter(String).length;

    for(i = 2; i <= lastRow; i++){
        //Check for dateAdded and process based on that
        var range = sheet.getRange("E"+i);
        if(range.getValue() == ''){
            processRow(range);
        }
        var idRange = sheet.getRange("G"+i);
        idRange.setValue(i);
    }

    //Process all rows with a set date added
    var dateAddedValue = sheet.getRange("E1:E").getValues();
    var lastRow = dateAddedValue.filter(String).length;

    Logger.log(lastRow);

    for(i = 2; i <= lastRow; i++){
        //Check for dateAdded and process based on that
        var range = sheet.getRange("E"+i);
        processRow(range);

        var idRange = sheet.getRange("G"+i);
        idRange.setValue(i);
    }

}

function processRow(range) {
    var sheet = range.getSheet();
    var rangeRow = range.getRow();

    Logger.log("Processing Row #"+rangeRow);

    //Column ranges
    var dateAddedRange = sheet.getRange("E" + rangeRow);
    var dateCompleteRange = sheet.getRange("F" + rangeRow);
    var taskRange = sheet.getRange("B" + rangeRow);
    var statusRange = sheet.getRange("A" + rangeRow);
    var urgencyRange = sheet.getRange("C" + rangeRow);
    var labelRange = sheet.getRange("D" + rangeRow);

    var date = new Date();
    var datestring = ("0" + date.getDate()).slice(-2) + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" +
        date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);

    //Automagic Timestamps
    if(taskRange.getValue() != '' && dateAddedRange.getValue() == ''){
        dateAddedRange.setValue(datestring);
    }

    //Parse labels
    if(taskRange.getValue() != ''){
        var reg = /label(\S*)/g;
        var match = reg.exec(taskRange.getValue());
        var label = '';

        while (match != null) {
            label += match[0].replace(/label/g, "") + ", ";
            match = reg.exec(taskRange.getValue());
        }

        label = label.replace("label", "")

        if(label.substring(0, label.length - 2).length)
            labelRange.setValue(label.substring(0, label.length - 2));
        taskRange.setValue(taskRange.getValue().replace(/label\S*/g, "").trim());
    }

    //Parse statuses
    if(taskRange.getValue() != ''){
        var reg = /status(\S*)/g;
        var match = reg.exec(taskRange.getValue());
        var status = '';

        while (match != null) {
            status += match[0].replace(/status/g, "") + ", ";
            match = reg.exec(taskRange.getValue());
        }

        status = status.replace("status", "")

        if(status.substring(0, status.length - 2).length)
            statusRange.setValue(status.substring(0, status.length - 2));
        taskRange.setValue(taskRange.getValue().replace(/status\S*/g, "").trim());
    }

    //Parse urgencies
    if(taskRange.getValue() != ''){
        var reg = /urgency(\S*)/g;
        var match = reg.exec(taskRange.getValue());
        var urgency = '';

        while (match != null) {
            urgency += match[0].replace(/urgency/g, "") + ", ";
            match = reg.exec(taskRange.getValue());
        }

        urgency = urgency.replace("urgency", "")

        if(urgency.substring(0, urgency.length - 2).length)
            urgencyRange.setValue(urgency.substring(0, urgency.length - 2));
        taskRange.setValue(taskRange.getValue().replace(/urgency\S*/g, "").trim());
    }

    //Set completion date
    if(dateCompleteRange.getValue() == '' && statusRange.getValue().toLowerCase() == "done"){
        dateCompleteRange.setValue(datestring);
    }

    //Auto-set Status if blank
    if(taskRange.getValue() != '' && statusRange.getValue() == ''){
        statusRange.setValue("Todo");
    }

    //Auto-set Urgency if blank
    if(taskRange.getValue() != '' && urgencyRange.getValue() == ''){
        urgencyRange.setValue("Normal");
    }

    //Remove #todo
    taskRange.setValue(taskRange.getValue().replace("#todo",""));

    //Removing unnecessary fields when task is unset
    if(taskRange.getValue() == ''){
        setTimeout(function(){sheet.deleteRow(rangeRow);}, 200);
    }
}

function doGet(event){
    var targetRow = event.parameter.row;
    var sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/"+event.parameter.sheetId+"/edit");

    updateColumn("status", targetRow, event.parameter.status, sheet);
    updateColumn("task", targetRow, event.parameter.task, sheet);
    updateColumn("urgency", targetRow, event.parameter.urgency, sheet);
    updateColumn("label", targetRow, event.parameter.label, sheet);

    return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function updateColumn(targetColumn, targetRow, targetValue, sheet){
    var targetRange;

    switch(targetColumn){
        case "status":
            Logger.log("Targeting A"+targetRow);
            targetRange = sheet.getRange("A"+targetRow);
            break;
        case "task":
            Logger.log("Targeting B"+targetRow);
            targetRange = sheet.getRange("B"+targetRow);
            break;
        case "urgency":
            Logger.log("Targeting C"+targetRow);
            targetRange = sheet.getRange("C"+targetRow);
            break;
        case "label":
            Logger.log("Targeting D"+targetRow);
            targetRange = sheet.getRange("D"+targetRow);
            break;
        case "dateadded":
            Logger.log("Targeting E"+targetRow);
            targetRange = sheet.getRange("E"+targetRow);
            break;
        case "datecompleted":
            Logger.log("Targeting F"+targetRow);
            targetRange = sheet.getRange("F"+targetRow);
            break;
    }

    if(targetRow > 1){
        targetRange.setValue(targetValue);
        processRow(targetRange);
    }

}