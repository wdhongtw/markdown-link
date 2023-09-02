// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {

    title = tab.title;
    chrome.storage.sync.get(null, (storage) => {
        for (index in storage.fieldsets) {
            regexUrl = new RegExp(storage.fieldsets[index].url, 'gi');
            if (regexUrl.test(tab.url)) {
                regexSearch = new RegExp(storage.fieldsets[index].search, 'gi');
                regexReplace = new RegExp(storage.fieldsets[index].replace, 'i');
                if (regexSearch.test(title)) {
                    title = title.replace(regexSearch, storage.fieldsets[index].replace);
                    // we don't stop in case there are several rules
                }
            }
        }

        var link = '[' + title + '](' + tab.url + ')';

        element = document.createElement('textarea');
        element.value = link;

        // It's required to put the temporary element to document tree before copy command
        // See: https://stackoverflow.com/questions/25622359/clipboard-copy-paste-on-content-script-chrome-extension
        document.body.appendChild(element);
        element.select();
        document.execCommand('copy');

        element.remove();

        chrome.browserAction.setBadgeText({
            text: 'Done',
            tabId: tab.id
        });

        var clear_callback = function () {
            chrome.browserAction.setBadgeText({
                text: '',
                tabId: tab.id
            });
        };
        window.setTimeout(clear_callback, 1500);
    });
});
