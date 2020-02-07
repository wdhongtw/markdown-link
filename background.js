
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    var link = '[' + tab.title + '](' + tab.url + ')';

    element = document.createElement("textarea");
    element.value = link;

    // It's required to put the temporary element to document tree before copy command
    // See: https://stackoverflow.com/questions/25622359/clipboard-copy-paste-on-content-script-chrome-extension
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');

    element.remove();
});
