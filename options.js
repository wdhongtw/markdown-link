const defaultRules = {
    url: ".*",
    search: "(.*)",
    replace: "$1",
};

window.addEventListener("DOMContentLoaded", () => {
    // Elements

    const listOfRule = document.getElementById("list-of-rule");
    const ruleTemplate = document.getElementById("rule-template");
    const addButton = document.getElementById("add-button");
    const saveButton = document.getElementById("save-button");
    const savedNotification = document.getElementById("saved-notification");

    // Initialization

    chrome.storage.sync.get(null, (storage) => {
        setRules(storage.rules);
        if (document.querySelectorAll(".remove-rule-button").length === 1) {
            document
                .querySelector(".remove-rule-button")
                .classList.add("hidden");
        }
    });

    function setRules(rules) {
        if (!rules) {
            return;
        }
        // Remove old rules
        const oldRules = listOfRule.querySelectorAll(".rule-row");
        for (let i = 0; i < oldRules.length; i++) {
            oldRules[i].remove();
        }
        // Add new rules
        for (let index in rules) {
            let ruleNode = ruleTemplate.content.cloneNode(true);
            ruleNode.querySelector(".url").value = rules[index].url;
            ruleNode.querySelector(".search").value = rules[index].search;
            ruleNode.querySelector(".replace").value = rules[index].replace;
            listOfRule.appendChild(ruleNode);
        }
    }

    // Events

    // Events - Add rules

    addButton.addEventListener("click", () => {
        listOfRule.appendChild(ruleTemplate.content.cloneNode(true));
        document
            .querySelector(".remove-rule-button")
            .classList.remove("hidden");
    });

    // Events - Save rules

    saveButton.addEventListener("click", () => {
        const data = {
            rules: [],
        };
        const rules = listOfRule.querySelectorAll(".rule-row");
        for (let i = 0; i < rules.length; i++) {
            data.rules.push({
                url: rules[i].querySelector(".url").value,
                search: rules[i].querySelector(".search").value,
                replace: rules[i].querySelector(".replace").value,
            });
        }
        chrome.storage.sync.set(data, () => {
            savedNotification.classList.remove("hidden");
            setTimeout(() => savedNotification.classList.add("hidden"), 1000);
        });
    });

    // Events - Remove rules

    listOfRule.addEventListener("click", (eventObject) => {
        const removeRuleButton = eventObject.target;
        if (removeRuleButton.classList.contains("remove-rule-button")) {
            removeRuleButton.parentElement.remove();
            const firstRemoveRuleButton = document.querySelector(
                ".remove-rule-button"
            );
            if (document.querySelectorAll(".remove-rule-button").length === 1) {
                firstRemoveRuleButton.classList.add("hidden");
            } else {
                firstRemoveRuleButton.classList.remove("hidden");
            }
        }
    });

    // Events - Import

    document.getElementById("import-button").addEventListener("click", () => {
        const fileChooser = document.createElement("input");
        fileChooser.type = "file";
        fileChooser.addEventListener("change", () => {
            const file = fileChooser.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const storage = JSON.parse("" + reader.result);
                setRules(storage.rules);
                saveButton.click();
            };
            reader.readAsText(file);
            form.reset();
        });
        const form = document.createElement("form");
        form.appendChild(fileChooser);
        fileChooser.click();
    });

    // Events - Load defaults

    document
        .getElementById("load-defaults-button")
        .addEventListener("click", () => setRules([defaultRules]));

    // Events - Export
    document.getElementById("export-button").addEventListener("click", () => {
        chrome.storage.sync.get(null, (storage) => {
            const result = JSON.stringify(storage);
            const url = "data:application/json;base64," + btoa(result);
            chrome.downloads.download({
                url: url,
                filename: "markdown-link-config.json",
            });
        });
    });
});
