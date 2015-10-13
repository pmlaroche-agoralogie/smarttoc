//debug choisir part ou global
debug = false;
debug_loadDB = false;

//test si chrome
var isMobile = true;
if (window.chrome)
{
	isMobile = false;
}

//global var settings
MC_UseOk = true;
MC_ProfileOk = true;

//sid questionnaires
quiz_profile = 544467;
quiz_quotidien = 916553;
quiz_hebdo = 313524;

// TODO
//plage de désactivation

window.onerror = function (errorMsg, url, lineNumber) {
	console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    
}