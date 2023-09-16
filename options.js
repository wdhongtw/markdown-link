const app = {};

app.initialStorage = {
    fieldsets: [{
        url: '.*',
        search: '(.*)',
        replace: '$1',
    }],
};

window.addEventListener('DOMContentLoaded', () => {

    // Elements

    const listOfFieldsets = document.getElementById('list-of-fieldsets');
    const fieldsetTemplate = document.getElementById('fieldset-template');
    const addButton = document.getElementById('add-button');
    const saveButton = document.getElementById('save-button');
    const savedNotification = document.getElementById('saved-notification');

    // Initialization

    chrome.storage.sync.get(null, (storage) => {
        setFieldsets(storage.fieldsets);
        if (document.querySelectorAll('.remove-fieldset-button').length === 1) {
            document.querySelector('.remove-fieldset-button').classList.add('hidden');
        }
    });

    function setFieldsets(fieldsets) {
        if (!fieldsets) {
            return;
        }
        // Remove old fieldsets
        const oldFieldsets = listOfFieldsets.querySelectorAll('.rule-row');
        for (let i = 0; i < oldFieldsets.length; i++) {
            oldFieldsets[i].remove();
        }
        // Add new fieldsets
        for (let index in fieldsets) {
            let fieldset = fieldsetTemplate.content.cloneNode(true);
            fieldset.querySelector('.url').value = fieldsets[index].url;
            fieldset.querySelector('.search').value = fieldsets[index].search;
            fieldset.querySelector('.replace').value = fieldsets[index].replace;
            listOfFieldsets.appendChild(fieldset);
        }
    }

    // Initialization - Examples

    (() => {
        for (const index in app.initialStorage.fieldsets) {

            const urlInput = document.createElement('input');
            urlInput.disabled = true;
            urlInput.className = 'url';
            urlInput.value = app.initialStorage.fieldsets[index].url;

            const searchInput = document.createElement('input');
            searchInput.disabled = true;
            searchInput.className = 'search';
            searchInput.value = app.initialStorage.fieldsets[index].search;

            const replaceInput = document.createElement('input');
            replaceInput.disabled = true;
            replaceInput.className = 'replace';
            replaceInput.value = app.initialStorage.fieldsets[index].replace;

            const li = document.createElement('li');
            li.appendChild(urlInput);
            li.appendChild(searchInput);
            li.appendChild(replaceInput);
        }
    })();

    // Events

    // Events - Add fieldset

    addButton.addEventListener('click', () => {
        listOfFieldsets.appendChild(fieldsetTemplate.content.cloneNode(true));
        document.querySelector('.remove-fieldset-button').classList.remove('hidden');
    });

    // Events - Save fieldsets

    saveButton.addEventListener('click', () => {
        const data = {
            fieldsets: [],
        };
        const fieldsets = listOfFieldsets.querySelectorAll('.rule-row');
        for (let i = 0; i < fieldsets.length; i++) {
            data.fieldsets.push({
                url: fieldsets[i].querySelector('.url').value,
                search: fieldsets[i].querySelector('.search').value,
                replace: fieldsets[i].querySelector('.replace').value,
            });
        }
        chrome.storage.sync.set(data, () => {
            savedNotification.classList.remove('hidden');
            setTimeout(() => savedNotification.classList.add('hidden'), 1000);
        });
    });

    // Events - Remove fieldset

    listOfFieldsets.addEventListener('click', (eventObject) => {
        const removeFieldSetButton = eventObject.target;
        if (removeFieldSetButton.classList.contains('remove-fieldset-button')) {
            removeFieldSetButton.parentElement.remove();
            const firstRemoveFieldsetButton = document.querySelector('.remove-fieldset-button');
            if (document.querySelectorAll('.remove-fieldset-button').length === 1) {
                firstRemoveFieldsetButton.classList.add('hidden');
            } else {
                firstRemoveFieldsetButton.classList.remove('hidden');
            }
        }
    });

    // Events - Import

    document
        .getElementById('import-button')
        .addEventListener('click', () => {
            const fileChooser = document.createElement('input');
            fileChooser.type = 'file';
            fileChooser.addEventListener('change', () => {
                const file = fileChooser.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    const storage = JSON.parse('' + reader.result);
                    setFieldsets(storage.fieldsets);
                    saveButton.click();
                };
                reader.readAsText(file);
                form.reset();
            });
            const form = document.createElement('form');
            form.appendChild(fileChooser);
            fileChooser.click();
        });

    // Events - Load defaults

    document
        .getElementById('load-defaults-button')
        .addEventListener('click', () => setFieldsets(app.initialStorage.fieldsets));

    // Events - Export
    document
        .getElementById('export-button')
        .addEventListener('click', () => {
            chrome.storage.sync.get(null, (storage) => {
                const result = JSON.stringify(storage);
                const url = 'data:application/json;base64,' + btoa(result);
                chrome.downloads.download({
                    url: url,
                    filename: 'markdown-link-config.json',
                });
            });
        });

});
