const optin = new URLSearchParams(window.location.search).get("optin");
const gdpr = new URLSearchParams(window.location.search).get("gdpr");
const vendor = new URLSearchParams(window.location.search).getAll("vendor");
const purpose1 = new URLSearchParams(window.location.search).getAll("purpose1");
const purpose7 = new URLSearchParams(window.location.search).getAll("purpose7");
const purpose8 = new URLSearchParams(window.location.search).getAll("purpose8");
const purpose9 = new URLSearchParams(window.location.search).getAll("purpose9");
const restriction1 = new URLSearchParams(window.location.search).get("restriction1");
const restriction7 = new URLSearchParams(window.location.search).get("restriction7");
const restriction8 = new URLSearchParams(window.location.search).get("restriction8");
const restriction9 = new URLSearchParams(window.location.search).get("restriction9");

window.__tcfapi = async (command, version, callback) => {
    if (command !== "addEventListener" || version !== 2) {
        return;
    }
    if (gdpr !== "applies") {
        return callback(await (await fetch(`../../../js/tcf/tcf-without-gdpr.json`)).json(), true);
    }

    const baseTcObject = await (await fetch(`../../../js/tcf/tcf-with-gdpr.json`)).json();
    baseTcObject.vendor.consents[758] = vendor.includes("consent");
    baseTcObject.vendor.legitimateInterests[758] = vendor.includes("legitimateInterest");
    baseTcObject.purpose.consents[1] = purpose1.includes("consent");
    baseTcObject.purpose.consents[7] = purpose7.includes("consent");
    baseTcObject.purpose.consents[8] = purpose8.includes("consent");
    baseTcObject.purpose.consents[9] = purpose9.includes("consent");
    baseTcObject.purpose.legitimateInterests[7] = purpose7.includes("legitimateInterest");
    baseTcObject.purpose.legitimateInterests[8] = purpose8.includes("legitimateInterest");
    baseTcObject.purpose.legitimateInterests[9] = purpose9.includes("legitimateInterest");
    // baseTcObject.publisher.restrictions[9] = purpose9.includes("legitimateInterest");
    //add state 0or1or2

    if (restriction1 === "0" || restriction1 === "1" || restriction1 === "2"){

        baseTcObject.publisher.restrictions[1] = {758: restriction1 * 1}
    }
    if (restriction7 === "0" || restriction7 === "1" || restriction7 === "2"){
        baseTcObject.publisher.restrictions[7] = {758: restriction7 * 1}
    }
    if (restriction8 === "0" || restriction8 === "1" || restriction8 === "2"){
        baseTcObject.publisher.restrictions[8] = {758: restriction8 * 1}
    }
    if (restriction9 === "0" || restriction9 === "1" || restriction9 === "2") {
        baseTcObject.publisher.restrictions[9] = {758: restriction9 * 1}
    }
    callback(baseTcObject, true);
}

window.addEventListener("DOMContentLoaded", () => {
    window.document.getElementById(`optin_${optin || "undefined"}`).checked = true;
    window.document.getElementById(`publisher_restrictions_${restriction1 || "undefined"}_purpose_1`).checked = true;
    window.document.getElementById(`publisher_restrictions_${restriction7 || "undefined"}_purpose_7`).checked = true;
    window.document.getElementById(`publisher_restrictions_${restriction8 || "undefined"}_purpose_8`).checked = true;
    window.document.getElementById(`publisher_restrictions_${restriction9 || "undefined"}_purpose_9`).checked = true;
    window.document.getElementById(`gdpr_${gdpr || "noapplies"}`).checked = true;
    vendor.forEach(value => window.document.getElementById(`vendor_${value}`).checked = true);
    purpose1.forEach(value => window.document.getElementById(`purpose1_${value}`).checked = true);
    purpose7.forEach(value => window.document.getElementById(`purpose7_${value}`).checked = true);
    purpose8.forEach(value => window.document.getElementById(`purpose8_${value}`).checked = true);
    purpose9.forEach(value => window.document.getElementById(`purpose9_${value}`).checked = true);
});
