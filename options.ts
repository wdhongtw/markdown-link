import * as core from './background.js';

async function initApplication() {
    // Elements

    const ruleContainer = document.getElementById("list-of-rule")!;
    const ruleTemplate = document.getElementById("rule-template")! as HTMLTemplateElement;

    const buttonReset = document.getElementById("load-defaults-button")!;
    const buttonAdd = document.getElementById("add-button")!;
    const buttonSave = document.getElementById("save-button")!;
    const notificationSaved = document.getElementById("saved-notification")!;

    const store = new core.ConfigStore();

    // Initialization
    await (async () => {
        const rules = await store.get(core.keyRules, []);
        setRules(rules);
    })();

    function setRules(rules: core.Rule[]) {
        // Remove old rules
        const oldRuleNodes = ruleContainer.querySelectorAll(".rule-row");
        for (const ruleNode of oldRuleNodes) {
            ruleNode.remove();
        }

        const ruleNodes = rules.map((rule) => {
            const ruleNode = ruleTemplate.content.cloneNode(true) as ParentNode;
            (ruleNode.querySelector(".url") as HTMLInputElement).value = rule.url;
            (ruleNode.querySelector(".search") as HTMLInputElement).value = rule.search;
            (ruleNode.querySelector(".replace") as HTMLInputElement).value = rule.replace;
            return ruleNode;
        });
        // Add new rules
        for (const ruleNode of ruleNodes) {
            ruleContainer.appendChild(ruleNode);
        }
    }

    // Events

    // Events - Add rules
    buttonAdd.addEventListener("click", () => {
        ruleContainer.appendChild(ruleTemplate.content.cloneNode(true));
    });

    // Events - Save rules
    buttonSave.addEventListener("click", async () => {
        const ruleNodes = ruleContainer.querySelectorAll(".rule-row");
        const rules = [...ruleNodes].map((ruleNode): core.Rule => ({
            url: (ruleNode.querySelector(".url") as HTMLInputElement).value,
            search: (ruleNode.querySelector(".search") as HTMLInputElement).value,
            replace: (ruleNode.querySelector(".replace") as HTMLInputElement).value,
        }))
        await store.set(core.keyRules, rules);
        notificationSaved.classList.remove("hidden");
        setTimeout(() => notificationSaved.classList.add("hidden"), 1000);
    });

    // Events - Remove rules
    ruleContainer.addEventListener("click", (eventObject) => {
        const removeRuleButton = eventObject.target! as HTMLElement;
        if (removeRuleButton.classList.contains("remove-rule-button")) {
            removeRuleButton.parentElement!.remove();
        }
    });

    // Events - Load defaults
    buttonReset.addEventListener("click", () => {
        const defaultRule: core.Rule = {
            url: ".*",
            search: "(.*)",
            replace: "$1",
        };
        setRules([defaultRule]);
    });
}

let loaded = false;

document.onreadystatechange = () => {
    if (document.readyState !== "loading" && !loaded) {
        initApplication();
        loaded = true;
    }
};
