// Allow overwriting the used sdk with url param sdkUrl
var urlParams = new URLSearchParams(window.location.search);
// Optin via GET param
var optinGetValue = urlParams.get('optin');
var optin = typeof optinGetValue === 'string' ? optinGetValue === 'true' : undefined;
