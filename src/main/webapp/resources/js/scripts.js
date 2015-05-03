var editFlag = false;
var oldTextPlace;
var connectionFlag = true;
var tmpMsgEdit;

var theMessage = function(messageText, userName, msgDate, msgId){
    return {
        message: messageText,
        user: userName,
        date: msgDate,
        id: msgId
    };
};

var appState = {
    username : 0,
    mainUrl : 'http://localhost:999/chat',
    messageList:[],
    token : 'TN11EN'
};

function run() {
    appState.username = restoreUsername() || 0;
    if (appState.username != 0){
        var tmp = document.getElementById('nameField');
        tmp.value = appState.username;
    }
    restoreMessages();
}

function idRandomiser(){
    return Math.floor(Date.now() * Math.random() * Math.random() / 1000000);
}

function restoreUsername(){
    if(typeof(Storage) == "undefined") {
        alert('Local Storage is not accessible');
        return;
    }

    var item = localStorage.getItem("Username");

    return item && JSON.parse(item);
}

function restoreMessages(continueWith){
   var url = appState.mainUrl + '?token=' + appState.token;
    getQuerry(url, function (responseText) {
        getMessageList(responseText, function () {
            setTimeout(function () {
                restoreMessages(continueWith);
            }, 1000);
        });
    });
}

function getMessageList(responseText, continueWith){
    console.assert(responseText != null);
    var response = JSON.parse(responseText);
    appState.token = response.token;
    fillMessageArea(response.messages);
    continueWith && continueWith();
}

function fillMessageArea(messageList){
    for (var i = 0; i < messageList.length; i++) {
        if (checkIfMessageExists(messageList[i]) == false) {
            appState.messageList.push(messageList[i]);
            if (messageList[i].user == appState.username) {
                insertUserMessage(messageList[i].user, messageList[i].message, messageList[i].date)
            }
            else {
                insertMessage(messageList[i].user, messageList[i].message, messageList[i].date)
            }
        }
    }
}

function checkIfMessageExists(msg){
    for (var i = 0; i < appState.messageList.length; i++){
        if (msg.id == appState.messageList[i].id){
            return true;
        }
    }
    return false;
}

function onNameButtonClick() {
    var tmp = document.getElementById('nameField');
    if (tmp.value == appState.username){
        return;
    }
    changeName(tmp.value);
}

function changeName(value, continueWith){
    if(!value){
        return;
    }
    renameDeclaration(value, continueWith);
    appState.username = value;
    localStorage.setItem("Username", JSON.stringify(value));
}

function renameDeclaration(value, continueWith){
    var msg;
    if (appState.username == 0) {
        msg = theMessage(value + " has joined to this chat.", "System", 0, idRandomiser());
        postQuerry(appState.mainUrl, JSON.stringify(msg), function () {
            continueWith && continueWith();
        });
    }
    else {
        msg = theMessage(appState.username + " has changed name to " + value, "System", 0, idRandomiser());
        postQuerry(appState.mainUrl, JSON.stringify(msg), function () {
            continueWith && continueWith();
        });
    }
}


function sendMessage(continueWith){
    if (connectionFlag == false){
        connectionAlert();
        return;
    }
    var userName = appState.username;
    if (userName == ''){
        window.alert('You have to sign up at first!');
        return;
    }
    if (editFlag == true){
        window.alert('You cant send new messages while editing the old one!');
        return;
    }
    var newMessage = document.getElementById('textInput');
    if (newMessage.value == '') {
        return;
    }
    var msg = theMessage(newMessage.value, userName, 0, idRandomiser());
    postQuerry(appState.mainUrl, JSON.stringify(msg), function () {
        continueWith && continueWith();
    });
    newMessage.value = '';
}

function insertUserMessage(userName, newMessage, date){
    var message = document.createElement('tr');
    message.classList.add('userMessageField');
    var messageFunctions = userFunctionsForming();
    var messageName = nameMessageForming(userName);
    var messageText = messageTextForming(newMessage);
    if (date == 0) {
        date = getTempDate();
    }
    var d = dateForming(date);
    message.appendChild(messageFunctions);
    message.appendChild(messageName);
    message.appendChild(messageText);
    message.appendChild(d);
    var destination = document.getElementById('chat');
    destination.appendChild(message);
}

function userFunctionsForming (){
    var messageFunctions = document.createElement('td');
    var editButton = document.createElement('input');
    editButton.setAttribute('type', 'button');
    editButton.classList.add('simpleButton');
    editButton.value = 'Edit';
    editButton.addEventListener('click', function(){editButtonClicked(this);});
    var deleteButton = document.createElement('input');
    deleteButton.setAttribute('type', 'button');
    deleteButton.classList.add('simpleButton');
    deleteButton.value = 'Delete';
    deleteButton.addEventListener('click', function(){deleteMessage(this);});
    messageFunctions.appendChild(deleteButton);
    messageFunctions.appendChild(editButton);
    return messageFunctions;
}

function nameMessageForming (userName){
    var messageName = document.createElement('td');
    messageName.innerHTML = userName;
    return messageName;
}

function messageTextForming(newMessage) {
    var messageText = document.createElement('td');
    messageText.innerHTML = newMessage;
    return messageText;
}

function dateForming(dat){
    var date = document.createElement('td');
    date.innerHTML = dat;
    return date;
}

function getTempDate() {
    var date;
    var currentDate = new Date();
    date =  currentDate.getHours() + ":"
    + currentDate.getMinutes() + ":"
    + currentDate.getSeconds() + " "
    + currentDate.getDate() + "."
    + (currentDate.getMonth() + 1) + "."
    + currentDate.getFullYear();
    return date;
}

function deleteMessage(thisButton, continueWith){
    if (connectionFlag == false){
        connectionAlert();
        return;
    }
    var place = thisButton.parentNode.parentNode.childNodes.item(3);
    var tmpMsg;
    for (var i = 0; i < appState.messageList.length; i++) {
        if (appState.messageList[i].date == place.innerHTML) {
            tmpMsg = appState.messageList[i];
        }
    }
    deleteQuerry(appState.mainUrl, JSON.stringify(tmpMsg), function () {
        continueWith && continueWith();
    });
    //shuffleMessages();
}

function shuffleMessages(){
    document.getElementById('chat').innerHTML = '';
    appState.token = 'TN11EN';
    appState.messageList.splice(0, appState.messageList.length);
}

function insertMessage(userName, newMessage, date){
    var message = document.createElement('tr');
    message.classList.add('messageField');
    var messageFunctions = FunctionsForming();
    var messageName = nameMessageForming(userName);
    var messageText = messageTextForming(newMessage);
    if (date == 0) {
        date = getTempDate();
    }
    var d = dateForming(date);
    message.appendChild(messageFunctions);
    message.appendChild(messageName);
    message.appendChild(messageText);
    message.appendChild(d);
    var destination = document.getElementById('chat');
    destination.appendChild(message);
}

function FunctionsForming (){
    return document.createElement('td');
}

function editButtonClicked(button){
    if (editFlag == true){
        window.alert("You are editing one message already!");
        return;
    }
    if (connectionFlag == false){
        connectionAlert();
        return;
    }
    editFlag = true;
    var oldDatePlace = button.parentNode.parentNode.childNodes.item(3);
    oldTextPlace = button.parentNode.parentNode.childNodes.item(2);
    document.getElementById('textInput').value = oldTextPlace.innerHTML;
    for (var i = 0; i < appState.messageList.length; i++){
        if (appState.messageList[i].date == oldDatePlace.innerHTML){
            tmpMsgEdit = appState.messageList[i];
        }
    }
}

function editMessage(continueWith){
    if (editFlag == false){
        window.alert("You have to select message to edit firstly!");
        return;
    }
    editFlag = false;
    var querryMsg = theMessage(document.getElementById('textInput').value, 0, 0, tmpMsgEdit.id);
    putQuerry(appState.mainUrl, JSON.stringify(querryMsg), function () {
        continueWith && continueWith()});
    document.getElementById('textInput').value = '';
    //shuffleMessages();
}

function changeIcon(icon){
    if (connectionFlag == false){
        icon.src=document.getElementById('offConnection').getAttribute('href');
    }
    else{
        icon.src=document.getElementById('onConnection').getAttribute('href');
    }
}

function getQuerry(url, continueWith, continueWithError) {
    ajax('GET', url, null, continueWith, continueWithError);
}

function postQuerry(url, data, continueWith, continueWithError) {
    ajax('POST', url, data, continueWith, continueWithError);
}

function putQuerry(url, data, continueWith, continueWithError) {
    ajax('PUT', url, data, continueWith, continueWithError);
}

function deleteQuerry(url, data, continueWith, continueWithError) {
    ajax('DELETE', url, data, continueWith, continueWithError);
}

function isError(text) {
    if(text == "")
        return false;

    try {
        var obj = JSON.parse(text);
    } catch(ex) {
        return true;
    }

    return !!obj.error;
}

function setConnectionStatus(statusFlag){
    connectionFlag = statusFlag;
    changeIcon(document.getElementById('connectionIcon'));
}

function ajax(method, url, data, continueWith, continueWithError) {
    var xhr = new XMLHttpRequest();

    continueWithError = continueWithError || defaultErrorHandler;
    xhr.open(method || 'GET', url, true);

    xhr.onload = function () {
        if (xhr.readyState !== 4)
            return;

        if(xhr.status != 200) {
            setConnectionStatus(false);
            continueWithError('Error on the server side, response ' + xhr.status);
            return;
        }

        if(isError(xhr.responseText)) {
            setConnectionStatus(false);
            continueWithError('Error on the server side, response ' + xhr.responseText);
            return;
        }
        continueWith(xhr.responseText);
    };

    xhr.ontimeout = function () {
        setConnectionStatus(false);
        continueWithError('Server timed out !');
    };

    xhr.onerror = function () {
        setConnectionStatus(false);
        var errMsg = 'Server connection error !\n'+
            '\n' +
            'Check if \n'+
            '- server is active\n'+
            '- server sends header "Access-Control-Allow-Origin:*"';

        continueWithError(errMsg);
    };

    xhr.send(data);
}

function defaultErrorHandler() {
    shuffleMessages();
}

function connectionAlert(){
    window.alert("Connection to the server has been lost. Please press F5 to try to reconnect to the server."
    + "If the problem won't remove, contact server administrator.");
}