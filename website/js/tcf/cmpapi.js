// 1. Read query parameter tcf=consent|legitimateinterest|noapplies

// Setup __tcfapi object that
    // Responds to addEventListener
    // Returns respective json object

const tcfParams = new URLSearchParams(window.location.search).getAll("tcf");
window.__tcfapi = async (command, version, callback) => {
    if (command !== "addEventListener" || version !== 2) {
        return;
    }
    if (tcfParams.includes("noapplies")) {
        return callback(await (await fetch(`js/tcf/tcf-without-gdpr.json`)).json(), true);
    }

    const baseTcObject = await (await fetch(`js/tcf/tcf-with-gdpr.json`)).json();
    baseTcObject.vendor.consents[758] = tcfParams.includes("consent");
    baseTcObject.vendor.legitimateInterests[758] = tcfParams.includes("legitimateInterest");
    callback(baseTcObject, true);
}