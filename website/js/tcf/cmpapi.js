const optin = new URLSearchParams(window.location.search).get("optin");
const gdpr = new URLSearchParams(window.location.search).get("gdpr");
const vendor = new URLSearchParams(window.location.search).getAll("vendor");
const purpose1 = new URLSearchParams(window.location.search).getAll("purpose1");
const purpose9 = new URLSearchParams(window.location.search).getAll("purpose9");

window.__tcfapi = async (command, version, callback) => {
    if (command !== "addEventListener" || version !== 2) {
        return;
    }
    if (gdpr !== "applies") {
        return callback(await (await fetch(`js/tcf/tcf-without-gdpr.json`)).json(), true);
    }

    const baseTcObject = await (await fetch(`js/tcf/tcf-with-gdpr.json`)).json();
    baseTcObject.vendor.consents[758] = vendor.includes("consent");
    baseTcObject.vendor.legitimateInterests[758] = vendor.includes("legitimateInterest");
    baseTcObject.purpose.consents[1] = purpose1.includes("consent");
    baseTcObject.purpose.legitimateInterests[1] = purpose1.includes("legitimateInterest");
    baseTcObject.purpose.consents[9] = purpose9.includes("consent");
    baseTcObject.purpose.legitimateInterests[9] = purpose9.includes("legitimateInterest");
    callback(baseTcObject, true);
}

window.addEventListener("DOMContentLoaded", () => {
    window.document.getElementById(`optin_${optin || "undefined"}`).checked = true;
    window.document.getElementById(`gdpr_${gdpr || "noapplies"}`).checked = true;
    vendor.forEach(value => window.document.getElementById(`vendor_${value}`).checked = true);
    purpose1.forEach(value => window.document.getElementById(`purpose1_${value}`).checked = true);
    purpose9.forEach(value => window.document.getElementById(`purpose9_${value}`).checked = true);
});
