//debug choisir part ou global
debug = false;
debug_loadDB = true;

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
quiz_profile = 579663;
quiz_quotidien = 321;
quiz_hebdo = 322;

// TODO
//plage de désactivation

window.onerror = function (errorMsg, url, lineNumber) {
	console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    
}