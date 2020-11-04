
const tcfParams = new URLSearchParams(window.location.search).getAll("tcf");
const optin = new URLSearchParams(window.location.search).getAll("optin");

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


for(let x = 0; x < tcfParams.length; x++) {
    const element = window.document.getElementById(tcfParams[x]);
    element.setAttribute("checked","checked")
}

for(let x = 0; x < optin.length; x++) {
    let element = window.document.getElementById("optin_" + optin[x]);
    if (!element) {
        element = window.document.getElementById("optin_undefined");
    }
    element.checked = true;
}



