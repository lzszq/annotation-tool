var result = JSON.parse(localStorage.getItem("result"));
var tagsArr = JSON.parse(localStorage.getItem("tag"));
var colors = [];
var rates = [0.5, 1, 2, 4, 8];
var ratesIndex = 1;
var player;
var duration = 0;
var width = 0;
var height = 0;
var done = false;
var activeTimeId = "";
var int;
var color = [
    "#E14A63",
    "#F3AA4D",
    "#C4C400",
    "#99CC99",
    "#2891DB",
    "#003366",
    "#996699",
    "#996633",
    "#999999",
    "#FF9999"
];
function randomColor(index) {
    if (index < 10) {
        return color[index];
    }
    var hex = Math.floor(Math.random() * 0xffffff).toString(16);
    while (hex.length < 6) {
        hex = "0" + hex;
    }
    return `#${hex}`;
}

var ratio = 1;
var urlId = getUrlParam("urlId");

var activeTime = [0];



function stateChange(flag) {
    if (flag) {
        int = window.setInterval("load()", 100);
    } else {
        window.clearInterval(int);
        $("#current")[0].innerText = parseInt(player.currentTime());
        $("#progressbar").width((player.currentTime() / duration) * width);
    }
}


function load() {
    $("#current")[0].innerText = parseInt(player.currentTime());
    $("#progressbar").width((player.currentTime() / duration) * width);
    if (player.currentTime() >= duration - 1) {
        window.clearInterval(int);
    }
}

$(function () {
    if (urlId) {
        activeTime = [0];
        for (let i in tagsArr) {
            tagsArr[i].push(randomColor(i));
        }
        var tagInfo = result[urlId].tagInfo.sort(compare("start"));

        $("#imageTag").show()


        $("[data-toggle='tooltip']").tooltip();

        var table = tagInfoToBe(result[urlId].tagInfo);
        $(".result").append(table);
        getData();
        initTagInfo();

        var url = "1"
        for (var i in urlsArr) {
            if (urlsArr[i].urlId == urlId) {
                url = urlsArr[i].url
            }
        }

        player = videojs($("#player")[0], {
            controls: true,
            preload: 'auto',
            autoplay: false,
            muted: true,
            playbackRates: rates,
            controlBar: {
                'volumePanel': false,
                'currentTimeDisplay': true,
                'fullscreenToggle': false,
                'pictureInPictureToggle': false,
                'remainingTimeDisplay': false
            },
            sources: [
                {
                    src: url,
                    type: 'video/mp4'
                }
            ]
        });

        player.on('loadedmetadata', () => {
            duration = parseInt(player.duration())
            $("#duration")[0].innerText = " / " + (duration - 1);
            $("#mp4Loaded").hide();
            $("#myProgress").show();
            loadProgress();
            $("#progress-bar").width((player.currentTime() / duration) * 100 + "%");

            $("#videoModal").modal();
            width = $("#progress").width();
            loadProgress();
            stateChange(true)
        })



        $("#videoModal").on("hide.bs.modal", function () {
            window.clearInterval(int);
            initTagInfo();
            if (player) {
                player.pause();
            }
        });
        $("#videoModal").on("hidden.bs.modal", function () {
            $(".delTagBtn").hide();
            activeTime = [];
        });
        var left = 0,
            bgleft = 0;

        $(document).keydown(function (e) {
            // var e = event || window.event;
            var k = e.keyCode || e.which;
            switch (k) {
                case 67: // C 67

                    player.pause();
                    left = player.currentTime()

                    if (activeTime.length == 0) {
                        activeTime = [getLastTime()]
                    }

                    if (parseInt(left) == getLastTime()) {
                        return false
                    }

                    var seekTo = parseFloat(left).toFixed(1);
                    player.currentTime(seekTo);
                    $("#current")[0].innerText = parseFloat(seekTo).toFixed(1);

                    var flag = false;
                    for (var i = 0; i < tagInfo.length; i++) {
                        if (
                            seekTo >= parseFloat(tagInfo[i].start) &&
                            seekTo <= parseFloat(tagInfo[i].end)
                        ) {
                            flag = true;
                            activeTime = [];
                            break;
                        }
                    }
                    if (!flag) {
                        changeActiveTime(seekTo);
                    }
                    stateChange(false)
                    break;

                case 32: // Spacebar 32
                    player.play()
                    stateChange(true)
                    break;

                case 37: // ArrowLeft 37
                    player.currentTime(player.currentTime() - 1)
                    stateChange(true)
                    break;

                case 38: // ArrowUp 38
                    if (ratesIndex < rates.length) {
                        ratesIndex += 1
                        player.playbackRate(rates[ratesIndex])
                    }
                    stateChange(true)
                    break;

                case 39: // ArrowRight 39
                    player.currentTime(player.currentTime() + 1)
                    stateChange(true)
                    break;

                case 40: // ArrowRight 40
                    if (ratesIndex > 0) {
                        ratesIndex -= 1
                        player.playbackRate(rates[ratesIndex])
                    }
                    stateChange(true)
                    break;
            }
            return false;
        });



        // $("#myProgress").mousemove(function (e) {
        //     player.pause();
        //     bgleft = $("#progress").offset().left;
        //     left = e.pageX - bgleft;
        //     $("[data-toggle='popover']").popover();
        //     $("#progressbar").width(left);
        //     var seekTo = (left / width) * duration;
        //     if (parseInt((left / width) * duration) >= duration) {
        //         seekTo = duration;
        //     }
        //     player.currentTime(seekTo);
        //     $("#current")[0].innerText = parseFloat(seekTo).toFixed(1);
        //     stateChange(false)
        // });
        $("#myProgress").click(function (e) {
            player.pause();
            bgleft = $("#myProgress").offset().left;
            left = e.pageX - bgleft;
            $("#progressbar").width(left);

            var seekTo = parseFloat((left / width) * duration).toFixed(1);
            if (left > width) {
                seekTo = duration;
            }
            player.currentTime(seekTo);
            $("#current")[0].innerText = parseFloat(seekTo).toFixed(1);

            var flag = false;
            for (var i = 0; i < tagInfo.length; i++) {
                if (
                    seekTo >= parseFloat(tagInfo[i].start) &&
                    seekTo <= parseFloat(tagInfo[i].end)
                ) {
                    flag = true;
                    activeTime = [];
                    break;
                }
            }
            if (!flag) {
                changeActiveTime(seekTo);
            }
            stateChange(false)
        });
    }
});

function getLastTime() {
    console.log(tagInfo)
    if (tagInfo.length == 0) {
        return 0
    }
    return tagInfo[tagInfo.length - 1].end
}

function toActiveTime(flag) {
    if (flag) {
        $(".delTagBtn").show();
        enableRadio();
    } else {
        if (activeTime.length == 0 || activeTime.length == 1) {
            $(".delTagBtn").hide();
            disableRadio();
        } else if (activeTime.length == 2) {
            $(".delTagBtn").show();
            enableRadio();
            var start = parseFloat(activeTime[0]);
            var end = parseFloat(activeTime[1]);
            var item = start;
            if (start > end) {
                start = end;
                end = item;
            }
            var background = "#ccc";
            addProgress(start, end, background);

        }
    }
}
function addProgress(start, end, background) {
    var progress = $("#myProgress");
    var percent = (end - start) / duration;
    var id = $(".my-progress-bar").length + 1;
    var progress_bar =
        '<div id="' +
        id +
        '" class="my-progress-bar"' +
        'style="background:' +
        background +
        ";width:" +
        percent * width +
        "px;left:" +
        (start / duration) * width +
        'px;"' +
        ' role="progressbar" aria-valuemin="0" aria-valuemax="100"' +
        ' data-toggle="popover" rel="popover"' +
        '" data-original-title="' +
        start +
        "s-" +
        end +
        's">' +
        "</div>";
    progress.append(progress_bar);
    $("[data-toggle='popover']").popover({
        trigger: "hover",
        placement: "top",
        container: "body"
    });
}
function changeActiveTime(time) {
    var length = activeTime.length;
    if (length == 0) {
        activeTime.push(getLastTime());
    } else if (length == 1) {
        if (parseFloat(time) - parseFloat(activeTime[0]).toFixed(1) == 0) {
            console.log("Repeat");
        } else {
            activeTimeId = "";
            activeTime.push(time);
            var start = 0;
            var end = 0;
            start = parseFloat(activeTime[0]);
            end = parseFloat(activeTime[1]);
            var item = start;
            if (start > end) {
                start = end;
                end = item;
            }
            var flag = false;
            console.log(start, end)
            
            for (var i = 0; i < tagInfo.length; i++) {
                console.log('for', tagInfo[i].start, tagInfo[i].end)
                if (
                    start <= parseFloat(tagInfo[i].start) &&
                    end >= parseFloat(tagInfo[i].end)
                ) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                activeTime = [start, end];
            } else {
                showTip("未覆盖", "warning", "500");
                loadProgress();
                activeTime = [];
            }
        }
    } else {
        loadProgress();
        activeTime = [];
        activeTime.push(time);
    }
    toActiveTime();
    if (activeTime.length == 1) {
        var start = activeTime[0];
        var progress = $("#myProgress");
        var id = $(".my-progress-bar").length + 1;
        var progress_bar =
            '<div id="' +
            id +
            '" class="my-progress-bar"' +
            'style="background:black;width:2px;' +
            "left:" +
            (start / duration) * width +
            'px;">' +
            "</div>";
        progress.append(progress_bar);
    }
}


function loadProgress() {
    $("[data-toggle='popover']").popover("hide");
    tagInfo = result[urlId].tagInfo.sort(compare("start"));
    var progress = $("#myProgress");
    progress.html("");
    for (let i in tagInfo) {
        var item = parseFloat(tagInfo[i].end) - parseFloat(tagInfo[i].start);
        var background = "";
        for (var j = 0; j < tagsArr.length; j++) {
            if (tagsArr[j][0] == tagInfo[i].tagId) {
                background = tagsArr[j][2];
            }
        }
        var percent = item / duration;
        var type = i % 2 == 0 ? "warning" : "danger";
        var id = $(".my-progress-bar").length + 1;
        var progress_bar =
            '<div id="' +
            id +
            '" onclick="changeSeek(' +
            tagInfo[i].start +
            "," +
            tagInfo[i].end +
            "," +
            id +
            ')"class="my-progress-bar"' +
            'style="background:' +
            background +
            ";width:" +
            percent * width +
            "px;left:" +
            (tagInfo[i].start / duration) * width +
            'px;"' +
            ' role="progressbar" aria-valuemin="0" aria-valuemax="100"' +
            ' data-toggle="popover" rel="popover" data-content="' +
            tagInfo[i].tag +
            '" data-tagid="' +
            tagInfo[i].tagId +
            '" data-original-title="' +
            tagInfo[i].start +
            "s-" +
            tagInfo[i].end +
            's">' +
            "<span>" +
            tagInfo[i].tagId;
        "</span>" + "</div>";
        progress.append(progress_bar);
    }
    $("[data-toggle='popover']").popover({
        trigger: "hover",
        placement: "top",
        container: "body"
    });
}
function changeSeek(start, end, id, flag) {
    window.event.stopPropagation();
    player.currentTime(start);
    player.play();
    $("#current")[0].innerText = parseFloat(start).toFixed(1);
    $("#progressbar").width((start / duration) * width);
    activeTimeId = id;
    activeTime = [start, end];
    toActiveTime(true);
}

function getData() {
    $("#row").html("");
    $(".radioBox").html("");
    for (var i = 0; i < tagsArr.length; i++) {
        var radio = "<div class='radio'><label>";
        radio +=
            "<input type='radio' disabled name='tag' onchange='changeTag(this)' value='" +
            tagsArr[i][0] +
            "'>" +
            "<span>" +
            tagsArr[i][1];
        radio +=
            "</span><p style='position:absolute;top:0;right:0;width:10px;height:10px;border-radio:10px;background:" +
            tagsArr[i][2] +
            "'></p></label></div>";
        $(".radioBox").append(radio);
    }

}
function initTagInfo() {
    var lis = $("#row li.fileDiv");
    for (var i = 0; i < lis.length; i++) {
        $(lis[i]).find("span.tag")[0].id = "";
        $(lis[i]).find("span.tag")[0].innerText = "";
        var id = parseFloat($(".time")[i].innerText);
        for (var j in tagInfo) {
            if (
                id <= parseFloat(tagInfo[j].end) &&
                id >= parseFloat(tagInfo[j].start)
            ) {
                $(lis[i]).find("span.tag")[0].id = tagInfo[j].tagId;
                $(lis[i]).find("span.tag")[0].innerText = tagInfo[j].tag;
                for (var k = 0; k < tagsArr.length; k++) {
                    if (tagsArr[k][0] == tagInfo[j].tagId) {
                        $(lis[i]).find("span.tag")[0].style.background = tagsArr[k][2];
                        break;
                    }
                }
                break;
            }
        }
    }
}

function delTag() {
    if (activeTime.length > 0) {
        activeTimeId = "";
        var my_progress_bar = $(".my-progress-bar");
        loadProgress();
        for (let i = 0; i < my_progress_bar.length; i++) {
            if (my_progress_bar[i].dataset.tagid) {
                var arr = my_progress_bar[i].dataset.originalTitle.split("-");
                var start = arr[0].slice(0, -1);
                var end = arr[1].slice(0, -1);
                if (activeTime[0] == start && activeTime[1] == end) {
                    $(".my-progress-bar")[i].remove();
                    break;
                }
            }
        }
        activeTime = [];
        toActiveTime();
        saveTimeInfo();
    }
}
function enableRadio() {
    var radios = $('input[type="radio"]');
    for (var i = 0; i < radios.length; i++) {
        $(radios[i])[0].disabled = false;
    }
}
function disableRadio() {
    var radios = $('input[type="radio"]');
    for (var i = 0; i < radios.length; i++) {
        radios[i].disabled = true;
        radios[i].checked = false;
    }
}

function changeTag(item) {
    if (activeTime.length > 0) {
        var my_progress_bar = $(".my-progress-bar");
        var tag = $(item)[0].nextSibling.innerText;
        var tagId = $(item)[0].value;
        var start = parseFloat(activeTime[0]);
        var end = parseFloat(activeTime[1]);
        var id = $(".my-progress-bar").length + 1;
        var flag = false;
        for (let i = 0; i < my_progress_bar.length; i++) {
            if (my_progress_bar[i].dataset.tagid) {
                if ($(".my-progress-bar")[i].id == activeTimeId) {
                    id = activeTimeId;
                    $(".my-progress-bar")[i].remove();
                    flag = true;
                    activeTimeId = "";
                    break;
                }
            }
        }
        activeTimeId = "";
        if (!flag) {
            loadProgress();
        }
        var progress = $("#myProgress");
        var item = parseFloat(end) - parseFloat(start);
        var background;
        for (var i = 0; i < tagsArr.length; i++) {
            if (tagsArr[i][0] == tagId) {
                background = tagsArr[i][2];
                break;
            }
        }
        var percent = item / duration;
        var progress_bar =
            '<div id="' +
            id +
            '" onclick="changeSeek(' +
            start.toFixed(0) +
            "," +
            end.toFixed(0) +
            "," +
            id +
            ')"class="my-progress-bar"' +
            'style="background:' +
            background +
            ";width:" +
            percent * width +
            "px;left:" +
            (start / duration) * width +
            'px;"' +
            ' role="progressbar" aria-valuemin="0" aria-valuemax="100"' +
            ' data-toggle="popover" rel="popover" data-content="' +
            tag +
            '" data-tagid="' +
            tagId +
            '" data-original-title="' +
            start.toFixed(0) +
            "s-" +
            end.toFixed(0) +
            's">' +
            "<span>" +
            tagId;
        "</span>" + "</div>";
        progress.append(progress_bar);
        $("[data-toggle='popover']").popover({
            trigger: "hover",
            placement: "top",
            container: "body"
        });
        activeTime = [];
        toActiveTime();
        saveTimeInfo();
    }
    disableRadio();
}
function saveTimeInfo(flag) {
    var oldState = result[urlId].state;
    if (!flag) {
        var my_progress_bar = $(".my-progress-bar");
        var newTagInfo = [];
        for (var i = 0; i < my_progress_bar.length; i++) {
            if (my_progress_bar[i].dataset.originalTitle) {
                var arr = my_progress_bar[i].dataset.originalTitle.split("-");
                var obj = {
                    tagId: my_progress_bar[i].dataset.tagid,
                    tag: my_progress_bar[i].dataset.content,
                    start: arr[0].slice(0, -1),
                    end: arr[1].slice(0, -1)
                };
                newTagInfo.push(obj);
            }
        }
        result[urlId].tagInfo = newTagInfo.sort(compare("start"));
        tagInfo = result[urlId].tagInfo;
        var table = tagInfoToBe(tagInfo);
        $(".result").html("");
        $(".result").append(table);
        loadProgress();
    } else {
        var answer = confirm("保存成功，是否返回首页？");
        if (answer) {
            result[urlId].times++;
            result[urlId].state = 1;
            if (oldState == 0) {
                localStorage.setItem(
                    "unTagTotal",
                    parseInt(localStorage.getItem("unTagTotal")) - 1
                );
                localStorage.setItem(
                    "tagedTotal",
                    parseInt(localStorage.getItem("tagedTotal")) + 1
                );
                localStorage.setItem("result", JSON.stringify(result));
                window.location.href = "./annotation_tool.html?type=unTag";
            } else {
                localStorage.setItem(
                    "tagedTotal",
                    parseInt(localStorage.getItem("tagedTotal")) - 1
                );
                localStorage.setItem(
                    "checkedTotal",
                    parseInt(localStorage.getItem("checkedTotal")) + 1
                );
                result[urlId].checked = true;
                localStorage.setItem("result", JSON.stringify(result));
                window.location.href = "./annotation_tool.html?type=taged";
            }
        } else {
            localStorage.setItem("result", JSON.stringify(result));
        }
    }
}
function tagInfoToBe(tagInfo) {
    var table = "";
    if (tagInfo.length > 0) {
        table +=
            "<table class='table'><thead><th>标签ID</th><th>标签</th><th>开始</th><th>结束</th>";
        for (var i in tagInfo) {
            if (tagInfo[i].start == tagInfo[i].end) {
                table +=
                    "<tr style='color:red;font-weight:bolder' onclick='goHere(this," +
                    JSON.stringify(tagInfo[i]) +
                    ")'>";
            } else {
                table +=
                    "<tr onclick='goHere(this," + JSON.stringify(tagInfo[i]) + ")'>";
            }
            for (var key in tagInfo[i]) {
                if (key == "start" || key == "end") {
                    table += "<td>" + tagInfo[i][key] + "s</td>";
                } else {
                    table += "<td>" + tagInfo[i][key] + "</td>";
                }
            }
            table += "</tr>";
        }
        table += "<table>";
    }
    return table;
}
function goHere(self, tagInfo) {
    var index = $(self)[0].rowIndex;
    var className = $(self)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()[0].className;
    if (className == "modelRight") {
        changeSeek(
            parseFloat(tagInfo.start).toFixed(0),
            parseFloat(tagInfo.end).toFixed(0),
            index,
            true
        );
    } else if (className == "tagRight") {
        var start = parseFloat(tagInfo.start);
        var end = parseFloat(tagInfo.end);
        var item = start;
        if (start >= end) {
            start = end;
            end = item;
        }
        var arr = [];
        for (var j = start; j < end + 1; j++) {
            arr.push(j);
        }

        $(".delTagBtn").show();
        $(".tagLeft").scrollTop(0);
        var fileDivs = document.getElementsByClassName("fileDiv");
        for (var i = 0; i < fileDivs.length; i++) {
            var id =
                fileDivs[i].children[0].children[0].children[0].children[1].children[0]
                    .innerText;
            if (tagInfo.start - id == 0) {
                var top = $(fileDivs[i]).position().top - 50;
                $(".tagLeft").scrollTop(top);
            }
        }
    }
}
function saveInfo(flag) {
    var oldState = result[urlId].state;
    if (!flag) {

        var table = tagInfoToBe(result[urlId].tagInfo);
        $(".result").html("");
        $(".result").append(table);
    } else {
        var answer = confirm("保存成功，是否返回首页？");
        if (answer) {
            result[urlId].times++;
            result[urlId].state = 1;
            if (oldState == 0) {
                localStorage.setItem(
                    "unTagTotal",
                    parseInt(localStorage.getItem("unTagTotal")) - 1
                );
                localStorage.setItem(
                    "tagedTotal",
                    parseInt(localStorage.getItem("tagedTotal")) + 1
                );
                localStorage.setItem("result", JSON.stringify(result));
                window.location.href = "./annotation_tool.html?type=unTag";
            } else {
                localStorage.setItem(
                    "tagedTotal",
                    parseInt(localStorage.getItem("tagedTotal")) - 1
                );
                localStorage.setItem(
                    "checkedTotal",
                    parseInt(localStorage.getItem("checkedTotal")) + 1
                );
                result[urlId].checked = true;
                localStorage.setItem("result", JSON.stringify(result));
                window.location.href = "./annotation_tool.html?type=taged";
            }
        } else {
            localStorage.setItem("result", JSON.stringify(result));
        }
    }
}

function format(arr) {
    var result = [];
    if (arr.length > 0) {
        var result = [];
        var tagInfoArr = [];
        var obj = {
            tagId: arr[0].tagId,
            tag: arr[0].tag,
            frameData: arr[0].frameData.concat()
        };
        tagInfoArr.push(obj);
        for (var i = 1; i < arr.length; i++) {
            var repeat = false;
            for (var j = 0; j < tagInfoArr.length; j++) {
                if (arr[i].tagId == tagInfoArr[j].tagId) {
                    repeat = true;
                    tagInfoArr[j].frameData.push(arr[i].frameData[0]);
                }
            }
            if (!repeat) {
                tagInfoArr.push(arr[i]);
            }
        }
        for (var i in tagInfoArr) {
            var frameData = tagInfoArr[i].frameData.concat();
            var data = dispart(frameData);
            var index = 0;
            for (var j = 0; j < data.length; j++) {
                var start = index;
                var end = index;
                if (data[j] != -1) {
                    end = j;
                } else {
                    index = parseFloat(j) + 1;
                    end = parseFloat(j) - 1;
                    result.push({
                        tagId: tagInfoArr[i].tagId,
                        tag: tagInfoArr[i].tag,
                        start: data[start],
                        end: data[end]
                    });
                }
            }
            result.push({
                tagId: tagInfoArr[i].tagId,
                tag: tagInfoArr[i].tag,
                start: data[start],
                end: data[end]
            });
        }
    }
    return result.sort(compare("start"));
}
function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    };
}
function dispart(arr) {
    var cnt = 0;
    var index = 0;
    var j = 0,
        i;
    var newArr = [arr[0]];
    var start = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] - start != newSpace) {
            newArr.push(-1);
        }
        newArr.push(arr[i]);
        start = arr[i];
    }
    return newArr;
}

function getUrlParam(paraName) {
    var url = decodeURI(document.location.toString());
    var arrObj = url.split("?");
    if (arrObj.length > 1) {
        var arrPara = arrObj[1].split("&");
        var arr;
        for (var i = 0; i < arrPara.length; i++) {
            arr = arrPara[i].split("=");
            if (arr != null && arr[0] == paraName) {
                return arr[1];
            }
        }
        return "";
    } else {
        return "";
    }
}
function cloneObj(obj) {
    var str,
        newobj = obj.constructor === Array ? [] : {};
    if (typeof obj !== "object") {
        return;
    } else if (window.JSON) {
        (str = JSON.stringify(obj)), (newobj = JSON.parse(str));
    } else {
        for (var i in obj) {
            newobj[i] = typeof obj[i] === "object" ? cloneObj(obj[i]) : obj[i];
        }
    }
    return newobj;
}
function delVideo(e) {
    var answer = confirm("确定要删除视频吗？");
    if (answer == true) {
        var oldState = result[urlId].state;
        result[urlId].times++;
        result[urlId].state = 2;
        if (oldState == 0) {
            localStorage.setItem(
                "unTagTotal",
                parseInt(localStorage.getItem("unTagTotal")) - 1
            );
            localStorage.setItem(
                "delTagTotal",
                parseInt(localStorage.getItem("delTagTotal")) + 1
            );
            localStorage.setItem("result", JSON.stringify(result));
            window.location.href = "./annotation_tool.html?type=unTag";
        } else {
            localStorage.setItem(
                "tagedTotal",
                parseInt(localStorage.getItem("tagedTotal")) - 1
            );
            localStorage.setItem(
                "delTagTotal",
                parseInt(localStorage.getItem("delTagTotal")) + 1
            );
            localStorage.setItem("result", JSON.stringify(result));
            window.location.href = "./annotation_tool.html?type=taged";
        }
    }
}