var prevData = {};
var contentHeaderOnly = '';
var updateInterval;
var inTransit = false;
var googleSheetId = "Paste Sheet Url ID Here";
var loginRequired = true;
var scriptUrl = "Paste Web App Script URL here";
scriptUrl += "?";


$(document).ready(function(){
    var url = scriptUrl;

    url += "&row="+"-2";
    url += "&sheetId="+googleSheetId;

    //JSONP contains it's own function call
    $.ajax({
        type: 'GET',
        url: url,
        async: true,
        contentType: "application/json",
        dataType: 'jsonp'
    });

    contentHeaderOnly = $('.todoTable').html();
    getData();
    updateInterval = setInterval(function(){getData();}, 10000);
    setTimeout(function(){
        if(loginRequired){
            $(".loginCard").show();
        }
    }, 2000);
});

function loginNeeded(isNeeded){
    if(!isNeeded){
        loginRequired = false;
        $(".loginCard").hide();
    }else{
        loginRequired = true;
    }
}

function ignoreLogin(ignore){
    if(ignore){
        $(".loginCard").hide();
        $(".btn", ".todoTable").addClass("disabled").attr('onclick', '');
        $(".btn-floating", ".todoTable").addClass("disabled").attr('onclick', '');
        loginRequired = true;
    }
}

function doLogin(){
    var url = scriptUrl;
    url += "&row="+"-3";
    url += "&sheetId="+googleSheetId;
    window.location = url;
}

function viewSourceData(){
    window.location = "https://docs.google.com/spreadsheets/d/" + googleSheetId + "/edit";
}

function showSetup() {
    $(".setupInstructions").show();
    $(".loginCard").hide();
    loginRequired = false;
}

function saveRow(rowNum){
    inTransit = true;
    //Gather Row Data
    var parent = $(".todoDataRow-"+rowNum);
    var data = {};

    $($(".save-button", parent).children()[0]).addClass("spinning");

    data.status = $(".statusDrop", parent).children(":selected").text();
    data.task = $($(".taskTextarea", parent).parent().children()[1]).text().trim();
    data.urgency = $(".urgencyDrop", parent).children(":selected").text();
    data.sheetId = googleSheetId;
    data.row = rowNum;
    data.labels = [];
    $(".chip", parent).each(function(){
        data.labels.push($(this).text());
    });

    data.labels = data.labels.join(", ").trim();

    var url = scriptUrl;

    url += "status="+data.status;
    url += "&task="+data.task;
    url += "&urgency="+data.urgency;
    url += "&label="+data.labels;
    url += "&row="+data.row;
    url += "&sheetId="+googleSheetId;

    if(data.task == ''){
        if(confirm("A blank task will be deleted, are you sure?")){
            $.ajax({
                type: 'GET',
                url: url,
                async: true,
                contentType: "application/json",
                dataType: 'jsonp',
                complete: function(){
                    inTransit = false;
                    $($(".save-button", parent).children()[0]).removeClass("spinning");
                    setTimeout(function(){getData();}, 200);
                }
            });
        }else{
            $($(".save-button", parent).children()[0]).removeClass("spinning");
        }
    }else{
        $.ajax({
            type: 'GET',
            url: url,
            async: true,
            contentType: "application/json",
            dataType: 'jsonp',
            complete: function(){
                inTransit = false;
                $($(".save-button", parent).children()[0]).removeClass("spinning");
                setTimeout(function(){getData();}, 200);
            }
        });

    }
}

function saveNewRow(){
    inTransit = true;
    //Gather Row Data
    var parent = $(".todoNewRow");
    var data = {};

    $($(".save-button", parent).children()[0]).addClass("spinning");

    data.status = $(".statusDrop", parent).children(":selected").text();
    data.task = $($(".taskTextarea", parent).parent().children()[1]).text().trim();
    data.urgency = $(".urgencyDrop", parent).children(":selected").text();
    data.sheetId = googleSheetId;
    data.row = -1;
    data.labels = $($(".newLabelTextarea").parent().children()[1]).text().trim();
    data.labels = data.labels.replace(",", "");
    tempLabels = data.labels.split(" ");
    data.labels = [];

    $.each(tempLabels, function(index, value){
        data.labels.push(value);
    });

    data.labels = data.labels.join(", ").trim();

    var url = scriptUrl;

    url += "status="+data.status;
    url += "&task="+data.task;
    url += "&urgency="+data.urgency;
    url += "&label="+data.labels;
    url += "&row="+data.row;
    url += "&sheetId="+googleSheetId;

    if(data.task == ''){
        if(confirm("A blank task will be deleted, are you sure?")){
            $.ajax({
                type: 'GET',
                url: url,
                async: true,
                contentType: "application/json",
                dataType: 'jsonp',
                complete: function(){
                    inTransit = false;
                    $($(".save-button", parent).children()[0]).removeClass("spinning");
                    setTimeout(function(){getData();}, 200);
                }
            });
        }else{
            $($(".save-button", parent).children()[0]).removeClass("spinning");
        }
    }else{
        $.ajax({
            type: 'GET',
            url: url,
            async: true,
            contentType: "application/json",
            dataType: 'jsonp',
            complete: function(){
                inTransit = false;
                $($(".save-button", parent).children()[0]).removeClass("spinning");
                setTimeout(function(){getData();}, 200);
            }
        });

    }
}

function deleteRow(rowNum){
    inTransit = true;
    //Gather Row Data
    var parent = $(".todoDataRow-"+rowNum);

    $($(".delete-button", parent).children()[0]).addClass("spinning");
    setTimeout(function(){
        $(".delete-button", parent).parent().parent().remove();
    },500);

    var url = scriptUrl;

    url += "status=Done";
    url += "&task=";
    url += "&urgency=Normal";
    url += "&label=";
    url += "&row="+rowNum;
    url += "&sheetId="+googleSheetId;

    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        complete: function(){
            inTransit = false;
            setTimeout(function(){getData();}, 200);
        }
    });

}

function getData(){
    if(!inTransit){
        var sheetUrl = "https://spreadsheets.google.com/feeds/list/" + googleSheetId + "/od6/public/values?alt=json";

        $.getJSON(sheetUrl).success(function(data){
            temp = data;
            data = [];
            if(typeof temp.feed.entry != "undefined"){
                $.each(temp.feed.entry, function(index, value){
                    tmpObj = {};
                    tmpObj.id = value.gsx$id.$t;
                    tmpObj.status = value.gsx$status.$t;
                    tmpObj.task = value.gsx$task.$t;
                    tmpObj.urgency = value.gsx$urgency.$t;
                    tmpObj.label = value.gsx$label.$t;
                    tmpObj.dateadded = value.gsx$dateadded.$t;
                    tmpObj.datecompleted = value.gsx$datecompleted.$t;

                    data.push(tmpObj);
                });
                updateTable(data);
            }else{
                //No data yet! Let em add a new row
                if($(".todoNewRow").length == 0){
                    addNewRow();
                }
            }
        }).fail(function(){
            showSetup();
        });
    }
}

function updateTable(data){
    if(JSON.stringify(data) == JSON.stringify(prevData)){
        //Do nothing
    }else{
        //otherwise update the table
        prevData = data;

        //Reset to header only
        $('.todoTable').html(contentHeaderOnly);

        //Iterate through data
        $.each(data, function(index, value){
            if(value.dateadded != ''){
                $('.todoTable').append(makeRow(value));
            }
        });

        //Elasticify those sections
        $(".elastic").elastic();
    }
}

function makeRow(data){
    var content = '<div class="todoRow z-depth-2 todoDataRow todoDataRow-' + data.id + ' status-'+data.status+'">' +
        '<button class="new-row-button btn-floating orange darken-2" title="Add New Task" onclick="addNewRow()">+</button>' +
        '<div class="todoCol controlCol"><button class="delete-button btn-floating btn-large red" onclick="$(\'.todoDataRow-'+data.id+' .confirm-delete-button\').toggle();"><i class="fa fa-trash"></i></button>' +
        '<button class="confirm-delete-button orange darken-1 btn-floating btn-large" style="display:none;" onclick="deleteRow('+data.id+')">Sure?</button>' +
        '<button class="save-button btn-floating btn-large " onclick="saveRow('+data.id+')"><i class="fa fa-floppy-o"></i></button></div>' +
        '<div class="todoCol statusCol browser-default">' + generateStatusDropdown(data.status) + '</div>' +
        '<div class="todoCol taskCol">' + generateTaskField(data.task) + '</div>' +
        '<div class="todoCol urgencyCol">' + generateUrgencyDropdown(data.urgency) + '</div>' +
        '<div class="todoCol labelCol">' + generateLabels(data.label) + '</div>' +
        '<div class="todoCol dateAddedCol">' + data.dateadded + '</div>' +
        '<div class="todoCol dateCompletedCol">' + data.datecompleted + '</div>' +
        '</div>';
    return content;
}

function makeNewRow(){
    var content = '<div class="todoRow todoNewRow z-depth-2">' +
        '<div class="todoCol controlCol"><button class="delete-button btn-floating btn-large red" onclick="$(this).parent().parent().remove();"><i class="fa fa-trash"></i></button>' +
        '<button class="save-button btn-floating btn-large " onclick="saveNewRow()"><i class="fa fa-floppy-o"></i></button></div>' +
        '<div class="todoCol statusCol browser-default">' + generateStatusDropdown('Todo') + '</div>' +
        '<div class="todoCol taskCol">' + generateTaskField('') + '</div>' +
        '<div class="todoCol urgencyCol">' + generateUrgencyDropdown('Normal') + '</div>' +
        '<div class="todoCol labelCol newLabelCol"><textarea class="elastic newLabelTextarea" placeholder="Label1, Label2, etc."></textarea></div>' +
        '<div class="todoCol dateAddedCol"></div>' +
        '<div class="todoCol dateCompletedCol"></div>' +
        '</div>';
    return content;
}

function addNewRow(){
    $('.todoTable').append(makeNewRow());
    $('.elastic').elastic();

}

function generateTaskField(task){
    return '<textarea class="elastic taskTextarea" placeholder="Some new task">' + task + '</textarea>';
}

function generateStatusDropdown(selected){
    var content = '<select class="statusDrop">' +
        '<option ' + (selected == 'Todo' ? "selected" : "") + '>Todo</option>' +
        '<option ' + (selected == 'Doing' ? "selected" : "") + '>Doing</option>' +
        '<option ' + (selected == 'Done' ? "selected" : "") + '>Done</option>' +
        '<option ' + (selected == 'Backburner' ? "selected" : "") + '>Backburner</option>' +
        '<option ' + (selected == 'Revived' ? "selected" : "") + '>Revived</option>' +
        '</select>';
    return content;
}

function generateUrgencyDropdown(selected){
    var content = '<select class="urgencyDrop">' +
        '<option ' + (selected == 'Lowest' ? "selected" : "") + '>Lowest</option>' +
        '<option ' + (selected == 'Lower' ? "selected" : "") + '>Lower</option>' +
        '<option ' + (selected == 'Low' ? "selected" : "") + '>Low</option>' +
        '<option ' + (selected == 'Normal' ? "selected" : "") + '>Normal</option>' +
        '<option ' + (selected == 'High' ? "selected" : "") + '>High</option>' +
        '<option ' + (selected == 'Higher' ? "selected" : "") + '>Higher</option>' +
        '<option ' + (selected == 'Highest' ? "selected" : "") + '>Highest</option>' +
        '</select>';
    return content;
}

function generateLabels(labelString){
    var labels = labelString.split(", ");

    var content = '';

    $.each(labels, function(index, label){
        if(label.trim().length > 0){
            content += '<div class="chip z-depth-1 orange darken-1">' + label + '</div>';
        }
    });

    return content
}
