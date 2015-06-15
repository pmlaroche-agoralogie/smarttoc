////////////////////
//DB

function init_DB(callback)
{
	//init base
	if(isMobile)
    	db = window.sqlitePlugin.openDatabase("Database", "1.0", "Demo", -1);
    else
    	db = openDatabase("Database", "1.0", "Demo", -1);
	
	
	db.transaction(function(tx) 
	{  
		
		// id                 
		// sid : Survey ID
		// sdescription-survey_config : configuration (ex: #scheduling:D#duration:2400#startHour:10/18#maxOccurences:42#dayOff:0#test:1#)
		// gid : group ID?
		// qid : question ID
		// question
		// qtype -> template question
		// qhelp-question_config -> Configuration : template question complément, fréquence (ex: #tpl:sl7#frq:b#)
		// answers : jsontab? ex : radio buttons

		//tx.executeSql('DROP TABLE IF EXISTS "questionnaires"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "questionnaires" ' +
						' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
						'  "sid" VARCHAR,' +
						'  "sdescription-survey_config" VARCHAR,' +
						'  "gid" VARCHAR,' +
						'  "qid" VARCHAR,' +
						'  "question" VARCHAR,' +
						'  "qtype" VARCHAR,' +
						'  "qhelp-question_config" VARCHAR,' +
						'  "answers" VARCHAR );',[],createQuestionnairesSuccess,createQuestionnairesError); 


		//tx.executeSql('DROP TABLE IF EXISTS "horaires"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "horaires" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "uidquestionnaire" VARCHAR, "tsdebut" INTEGER, "dureevalidite" INTEGER, "notification" INTEGER, "fait" INTEGER);');                                          

		//tx.executeSql('DROP TABLE IF EXISTS "reponses"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" INTEGER DEFAULT (0), "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse" INTEGER, "envoi" BOOLEAN not null default 0);',
				[],
				function(tx){callback(tx,'db2')},
				function(tx){callback(tx,'db1')});
	
		console.log("db");
		//callback();
	},function(tx){},function(tx){callback(tx,'db')});
	//callback('aps db');
}

function errorHandler(tx, error) {
    console.log("Error: " + error.message);
}
function successHandler(tx, result) {
    console.log("Success: " + result);
}

function createQuestionnairesSuccess(tx, result){
	if(isMobile)
	{
		store = cordova.file.applicationDirectory;
		fileName = "www/db/questionnaires.txt";
		window.resolveLocalFileSystemURL(store + fileName, readQuestionnairesSuccess, readQuestionnairesFail);
	}
	else
	{
		store = '';
	}
		
	
	console.log("dbquest");
	//callback();
};
function createQuestionnairesError(tx, error) {
    console.log("createQuestionnairesError: " + error.message);
}
function readQuestionnairesSuccess(fileEntry) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
			console.log(' reader');
			res = this.result;
			//console.log("Text is: "+this.result);
			db.transaction(function(tx) {
				var line = res.split("\n");
				for (var linekey in line)
				{
					var line2 = line[linekey].split("';'");
					(function (value) { 
						tx.executeSql('SELECT COUNT("id") as cnt FROM "questionnaires" WHERE sid = "'+line2[0].substring(1,line2[0].length)+'";', [], function(tx, res) {
							//console.log(line2[0].substring(1,line2[0].length));
							//console.log(value[0].substring(1,value[0].length));
							if (res.rows.item(0).cnt < 1)
							{
								tx.executeSql('INSERT INTO "questionnaires" (sid, "sdescription-survey_config", gid,qid, question, qtype,"qhelp-question_config", answers) VALUES("'+
										value[0].substring(1,value[0].length)+'","'+
										value[1]+'","'+
										value[2]+'","'+
										value[3]+'","'+
										value[4]+'","'+
										value[5]+'","'+
										value[6]+'","'+
										escape(JSON.stringify(line2[7].substring(0,value[7].length-1)))+'");',[], successHandler, errorHandler);
								//line2[7].substring(0,line2[7].length-1).replace(/"/g,'\\"')+'");',[], successHandler, errorHandler);
							}//fin if
						},errorHandler);//fin select
					})(line2);
				}
			});
		}
		reader.readAsText(file);
	});
}
function readQuestionnairesFail(e) {
	console.log("FileSystem Error");
	console.dir(e);
}


////////////////////
//Functions MC_UseOk

function is_MC_UseOk($state){
	db.transaction(function(tx) 
	{
		//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
		tx.executeSql('SELECT * FROM "reponses" where sid = "useOK" AND reponse = "ok";', [], function(tx, res) {
			if (res.rows.item(0).cnt < 1)
			{
				console.log('MC_UseOk:false');
				return false;
			}
			else
			{
				console.log('MC_UseOk:true');
				return true;
			}
				
		});//fin select
	}); //fin db.transaction
}

testi = 0;
//function test(value){
var test = function(tx,value){
	testi = testi + 1;
	console.log(testi);
	console.log(value);
	console.log("fin?");
}
