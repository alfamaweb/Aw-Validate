chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        var dados = document.getElementsByTagName('html')[0].innerHTML.toString();;
            sendResponse({ dom: dados });
    }
);