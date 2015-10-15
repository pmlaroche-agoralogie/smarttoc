var async = require('../dist/js/async.js');

/////////////////////////////////////////////////////////////////////
//DB
/////////////////////////////////////////////////////////////////////

//DB common
function errorHandler(tx, error) {
    console.log("Error: " + error.message);
}
function successHandler(tx, result) {
    console.log("Success: " + result);
}

// DB init
function init_DB(callback)
{
	//init base
	if(isMobile)
    	db = window.sqlitePlugin.openDatabase("Database_SmartToc", "1.0", "Demo", -1);
    else
    	db = openDatabase("Database_SmartToc", "1.0", "Demo", -1);
	callback(null,'initDb');
}

function createTableQuestionnaires(callback)
{
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
								'  "answers" VARCHAR );');
								//'  "answers" VARCHAR );',[],callback(null,'createQuestionnairesSuccess'),callback(true,'createQuestionnairesError'));
								//'  "answers" VARCHAR );',[],createQuestionnairesSuccess,createQuestionnairesError);
			//});
			},function(tx){callback(true,'createQuestionnairesError')},function(tx){callback(null,'createQuestionnairesSuccess')});
}


function createTableHoraires(callback)
{
	db.transaction(function(tx) 
	{  		
		//tx.executeSql('DROP TABLE IF EXISTS "horaires"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "horaires" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "uidquestionnaire" VARCHAR, "tsdebut" INTEGER, "dureevalidite" INTEGER, "notification" INTEGER, "fait" INTEGER);');                                          
	},function(tx){callback(true,'createHorairesError')},function(tx){callback(null,'createHorairesSuccess')});
}

function createTableReponses(callback)
{
	db.transaction(function(tx) 
	{  		
		//tx.executeSql('DROP TABLE IF EXISTS "reponses"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" INTEGER DEFAULT (0), "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse" INTEGER, "envoi" BOOLEAN not null default 0);');
	},function(tx){callback(true,'createReponsesError')},function(tx){callback(null,'createReponsesSuccess')});
}


function createQuestionnairesSuccess(callback){
	var req = new XMLHttpRequest();
	req.open('GET', '../www/db/questionnaires.txt', true);

	req.onreadystatechange = function (aEvt) {
		if (req.readyState == 4) 
		{
			if(req.status == 200)
			{
				if (debug || debug_loadDB)
					alertDebug("req.status == 200");
				res = req.responseText;
				insertQuestionnaire(res,callback);
			}
			else
			{
				console.log("Erreur pendant le chargement de la page.\n");
				if (debug || debug_loadDB)
					alertDebug("Erreur pendant le chargement de la page.\n Ou cas Iphone")
				if(isMobile)
				{
					//cas iphone
					store = cordova.file.applicationDirectory;
					fileName = "www/db/questionnaires.txt";
					window.resolveLocalFileSystemURL(store + fileName, function(fileEntry){readQuestionnairesSuccess(fileEntry,callback) }, readQuestionnairesFail);		
				}
			}
		}
	};
	req.send(null);

	if (debug || debug_loadDB)
		alertDebug("createQuestionnairesSuccess");
};

function createHorairesSuccess(callback)
{
	console.log('createHorairesSuccess');
	//tx.executeSql('CREATE TABLE IF NOT EXISTS "horaires" ("id" INTEGER PRIMARY KEY AUTOINCREMENT ,
	//"uidquestionnaire" VARCHAR, "tsdebut" INTEGER, "dureevalidite" INTEGER, "notification" INTEGER, "fait" INTEGER);');      
	xhr_object = new XMLHttpRequest(); 
	xhr_object.timeout = 4000; // Set timeout to 4 seconds (4000 milliseconds)
	xhr_object.open("GET", "http://restitution.altotoc.fr/horaires_smarttocv1.php", true);  
	xhr_object.send(null); 
	xhr_object.ontimeout = function () { console.log('timeout');$scope.encours = false;callback(null,'idko');}
	xhr_object.onreadystatechange = function () {
		if(xhr_object.readyState == 4) 
		{
			
			//setTimeout(function() {
			console.log('Id récupéré !');
			console.log(xhr_object);
			console.log(xhr_object.response);
			var MyHoraires = JSON.parse(xhr_object.response);
			db.transaction(function(tx) 
			{  
				for(var k in MyHoraires) {
					   console.log(k, MyHoraires[k]);
					   console.log('SELECT COUNT("id") as cnt FROM "horaires" WHERE uidquestionnaire = "'+MyHoraires[k].sid+'" AND tsdebut = "'+MyHoraires[k].ts+'"');
					   (function (value) { 
					   tx.executeSql('SELECT COUNT("id") as cnt FROM "horaires" WHERE uidquestionnaire = "'+MyHoraires[k].sid+'" AND tsdebut = "'+MyHoraires[k].ts+'";', [], function(tx, res) {
						   if (res.rows.item(0).cnt < 1)
						   {
							   tx.executeSql('INSERT INTO "horaires" (uidquestionnaire, tsdebut) VALUES("'+
									   value.sid+'","'+
									   value.ts+'");',[], successHandler, errorHandler);
						   }
					   },createQuestionnairesError); //SELECT COUNT
					   })(MyHoraires[k]);
					   
				}
			},function(tx){callback(true,'setHorairesError')},function(tx){callback(null,'setHorairesSuccess')});
			//});//DB TRANSACTION
			/*$scope.userId = xhr_object.response;
			$scope.encours = false;
			//$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
			callback(null,'idok');*/
			//},1250);
		}
	}
}


function createQuestionnairesError(tx, error) {
    console.log("createQuestionnairesError: " + error.message);
}

function readQuestionnairesSuccess(fileEntry,callback) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
			console.log(' reader');
			res = this.result;
			insertQuestionnaire(res,callback);
		}
		reader.readAsText(file);
	});
}

function readQuestionnairesFail(e) {
	console.log("FileSystem Error");
	console.dir(e);
}

function insertQuestionnaire(res,callback){
	db.transaction(function(tx) {
		var line = res.split("\n");
		for (var linekey in line)
		{
			var line2 = line[linekey].split("';'");
			(function (value) { 
				tx.executeSql('SELECT COUNT("id") as cnt FROM "questionnaires" WHERE sid = "'+line2[0].substring(1,line2[0].length)+'";', [], function(tx, res) {
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
								encodeURI(value[7].substring(0,value[7].length-1))+'");',[], successHandler, errorHandler);
								//escape(JSON.stringify(line2[7].substring(0,value[7].length-1)))+'");',[], successHandler, errorHandler);
						//line2[7].substring(0,line2[7].length-1).replace(/"/g,'\\"')+'");',[], successHandler, errorHandler);
					}//fin if
				},errorHandler);//fin select
			})(line2);
		}
	},function(tx){callback(true,'err')},function(tx){callback(null,'ok')});
}


function getQuestionsBySID($scope,sid,current,callback)
{
	if (debug)
		alert('getQuestionsBySID');
	db.transaction(function(tx) {
		console.log('SELECT * FROM "questionnaires" WHERE sid = '+sid+' LIMIT '+(current-1)+','+current+';');
		tx.executeSql('SELECT * FROM "questionnaires" WHERE sid = '+sid+' LIMIT '+(current-1)+',1;', [], function(tx, res) {
			if (debug)
				alert('getQuestionsBySID');
			if (debug) alert('scope getQuestionsByGroupe1');
			if (debug) alert(JSON.stringify($scope.quiz));
			console.log('question');
			//console.log(res);
			//if (res.rows.item(0).cnt < 1)
			if (res.rows.length < 1)
			{
				console.log('fin');
				$scope.quiz.actif = 'fin';
				callback(null,'fin');
			}
			else
				
			{
				var groupes = {};
				var next = 0;
				groupe = res.rows.item(0);
				groupe.config = getQuestionConfig(res.rows.item(0)['qhelp-question_config']);
				groupe.reponses = JSON.parse(decodeURI(res.rows.item(0).answers));
				groupes[0] = groupe;
				next = current + 1;
				$scope.quiz.groupes = groupes;
				$scope.quiz.next = next;
				$scope.quiz.actif = true;
				callback(null,'ok');
				
				/*tx.executeSql('SELECT * FROM "questionnaires" WHERE gid = "'+res.rows.item(0)['gid']+'";', [], function(tx, res2) {		
					if (debug)
						alert('getQuestionsByGroupe2');
					var groupes = {};
					var next = 0;
					for (var i = 0; i < res2.rows.length; i++)
		            {
						groupe = res2.rows.item(i);
						groupe.config = getQuestionConfig(res2.rows.item(i)['qhelp-question_config']);
						groupe.reponses = JSON.parse(decodeURI(res2.rows.item(i).answers));
						groupes[i] = groupe;
						next = parseInt(res2.rows.item(i).id) + 1;
		            }
					$scope.quiz.groupes = groupes;
					$scope.quiz.next = next;
					$scope.quiz.actif = true;
					callback(null,'ok');
					
				}); //SELECT GROUPE*/
			}
		});//select
	//},function(tx){callback(true,'err')},function(tx){callback(null,'ok')});//DB transaction
	});//DB transaction
	
}

function displayQuestionTemplate($route,$location,$scope,sid,current){
	console.log('displayQuestionTemplate');
	console.log($scope.quiz);
		console.log(current);
		if (debug)
			alert('displayQuestionTemplate');
		if (debug)
			alert(current);
		
		 async.series([ function(callback){ getQuestionsBySID($scope,sid,current,callback);}                            
		],
			 
			function(err, results ){	
			 console.log('ici');
			 	
			 	if ($scope.quiz.actif == "fin")
			 		if ($scope.quiz.sid == quiz_profile)
			 		{
			 			console.log('fin profile');
			 			//TODO: fonction envoi.
			 			
			 			//TODO: fonction enregistre fin.
			 			save_MC_ProfileOk();
			 			
			 			//go to next profile
			 			$scope.profileok = "page5";
			 			
			 			//Change path
						$location.path('/profileok'); 
						$scope.menu = false;
						$route.reload();
			 		}
			 	$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
			/*	console.log(results);
				if (debug) alert(JSON.stringify($scope.quiz));
				var timestamp = Math.round(new Date().getTime() / 1000);
			 	$scope.quiz.tsdeb = timestamp;
				$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
				console.log($scope.quiz);*/
		}
		);//fin  async.series

}

function saveReponses(quiz,callback)
{
	console.log('save');
	console.log(quiz);
	var timestamp = Math.round(new Date().getTime() / 1000);
 	quiz.tsfin = timestamp;
	

	db.transaction(function(tx) {
		console.log('quiz????');
		console.log(quiz);
		$.each( quiz.groupes, function( key, groupe ) {
			console.log(quiz);
			console.log(groupe);
			var sql = "";
			//console.log('save ' + this.attr('monID'));
			console.log('save groupe ???????????');
			console.log(groupe);
			console.log('save groupe !!!!!!!!!!');
			reponse = "";
			if ((groupe.config.tpl == 'texte') || (groupe.config.tpl == 'libre_age'))
			{
				console.log('save texte');
				//tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" VARCHAR, "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse_deb" INTEGER, "tsreponse_fin" INTEGER, "envoi" BOOLEAN not null default 0);');
				
				reponse = $('.question[monID="'+groupe.qid+'"] input').val();
				
			}
			if ((groupe.config.tpl == 'radio') || (groupe.config.tpl == 'radio_demo_genre'))
			{
				
				console.log('save radio');
				reponse = $('.question[monID="'+groupe.qid+'"] input:checked').val();
			}
			if (groupe.config.tpl == 'slider')
			{
				console.log('save slider');
				reponse = $('.question[monID="'+groupe.qid+'"] input').val();
			}
			//sql ='INSERT INTO "reponses" (idhoraire,sid, gid,qid, reponse, tsreponse_deb,tsreponse_fin) '+
			sql ='INSERT INTO "reponses" (idhoraire,sid, gid,qid, reponse,tsreponse) '+
			
			'VALUES('+
			'"'+quiz.uuid+'",'+ //uuid
			'"'+groupe.sid+'",'+ // sid
			'"'+groupe.gid+'",'+ //gid
			'"'+groupe.qid+'",'+ //qid
			'"'+reponse+'",'+ //reponse
			//''+quiz.tsdeb+','+ //tsreponse_deb
			''+quiz.tsfin+''+ //tsreponse_fin
			');';
			
			console.log(sql);
			if (sql != "")
			{
				
					(function (reqSql) { 
						tx.executeSql(reqSql,[], successHandler, errorHandler);// requête
					})(sql);
			
			}
		});
	},function(tx){callback(true,'err')},function(tx){callback(null,'ok')});// DB TRANSACTION
	//});// DB TRANSACTION
}


////////////////////
//Functions after_init
function after_init(){
	console.log('after_init');
	if (MC_UseOk)
	{
		console.log('MC_UseOk');
		do_MC_UseOk();
	}
}

/////////////////////////////////////////////////////////////////////
//Functions MC_UseOk
/////////////////////////////////////////////////////////////////////

function do_MC_UseOk(callback,$location,$route,$scope){
	if (MC_UseOk)
	{
		console.log('MC_UseOk');
		db.transaction(function(tx) 
		{
			(function ($location,$scope) { 
				//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
				tx.executeSql('SELECT * FROM "reponses" where sid = "useOK" AND reponse = "ok";', [], function(tx, res) {
					console.log(res);
					var dataset = res.rows.length;
		            if(dataset<1)
					//if (res.rows.item(0).cnt < 1)
					{
						console.log('MC_UseOk:false');
						//Change path
						$location.path('/useok'); 
						$scope.menu = false;
						$route.reload();
						
						//callback(true,"MC_UseOk_false");
						//return false;
					}
					else
					{
						console.log('MC_UseOk:true');
						//callback(null,"MC_UseOk_true");
						MC_ProfileOk(callback,$location,$route,$scope);
						//return true;
					}
						
				});//fin select
			})($location,$scope);
		}); //fin db.transaction
	}
	else
	{
		//ok
		//callback(null,"no_MC_UseOk");
		MC_ProfileOk(callback,$location,$route,$scope);
	}
}

function save_MC_UseOk()
{
	db.transaction(function(tx) 
	{
		tx.executeSql('INSERT INTO "reponses" (sid, reponse,envoi) VALUES ("useOK","ok",1)');
	}); //fin db.transaction
}

/////////////////////////////////////////////////////////////////////
//Functions MC_ProfileOk
/////////////////////////////////////////////////////////////////////
function MC_ProfileOk(callback,$location,$route,$scope){
//function MC_ProfileOk($location,$route){
	if (MC_ProfileOk)
	{
		console.log('MC_ProfileOk');
		db.transaction(function(tx) 
		{
			(function ($location,$scope) { 
				//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
				tx.executeSql('SELECT * FROM "reponses" where sid = "'+quiz_profile+'" AND reponse = "done";', [], function(tx, res) {
					console.log(res);
					var dataset = res.rows.length;
		            if(dataset<1)
					//if (res.rows.item(0).cnt < 1)
					{
						console.log('MC_ProfileOk:false');
						//Change path
						$location.path('/profileok'); 
						$scope.menu = false;
						$route.reload();
						$scope.profileok = "page1";
						if (callback)
							callback(true,"MC_ProfileOk_false");
						//return false;
					}
					else
					{
						console.log('MC_ProfileOk:true');
						//Change path
						$location.path('/'); 
						$scope.menu = true;
						$route.reload();
						//callback(null,"MC_UseOk_true");
						return true;
					}
						
				});//fin select
			})($location,$scope);
		}); //fin db.transaction
	}
	else
	{
		//ok
		if (callback)
			callback(null,"no_MC_ProfileOk");
		$location.path('/'); 
		$scope.menu = true;
	}
}

function save_MC_ProfileOk()
{
	db.transaction(function(tx) 
	{
		tx.executeSql('INSERT INTO "reponses" (sid, reponse,envoi) VALUES ("'+quiz_profile+'","done",1)');
	}); //fin db.transaction
}


/////////////////////////////////////////////////////////////////////
//Functions Debug
/////////////////////////////////////////////////////////////////////

//Function affichage debug
function alertDebug(message)
{
	if (isMobile)
	navigator.notification.alert(
			message,  // message
		    function(){},         // callback
		    'Debug',            // title
		    'Ok'                  // buttonName
		);
	else
		alert(message);
}

/////////////////////////////////////////////////////////////////////
//Functions Decode
/////////////////////////////////////////////////////////////////////

function getSurveyConfig()
{
	var config = {};
	var strSurveyConfig = surveys_languagesettings[0].surveyls_description;
	//alert(surveys_languagesettings[0].surveyls_description);
	var line = strSurveyConfig.split("#");
	for (var linekey in line)
	{
		line2 = line[linekey].split(":");
		if (line2[0]!= "")
		{
			line20=line2[0];
			line21=line2[1];
			config[line20] = line21;
		}
	}
	return config;
}

function getQuestionConfig(qhelp)
{
	var config = {};
	//var strSurveyConfig = question.help;
	//alert(surveys_languagesettings[0].surveyls_description);
	var line = qhelp.split("#");
	for (var linekey in line)
	{
		line2 = line[linekey].split(":");
		if (line2[0]!= "")
		{
			line20=line2[0];
			line21=line2[1];
			config[line20] = line21;
		}
	}
	return config;
}

//ENVOI REPONSES
function sendReponses() {
	console.log('send');
	var aReponses ={};
	db.transaction(function(tx) {

		tx.executeSql('SELECT * FROM "horaires" WHERE fait = 1;', [], function(tx, resHoraires) {

		//tx.executeSql('SELECT DISTINCT idhoraire FROM "reponses" WHERE envoi = 0', [], function(tx, resHoraires) {
			
			var dataset = resHoraires.rows.length;
			console.log(resHoraires);
            if(dataset>0)
            {     	
            	if (debug)
            		alert("session à  envoi");
            	for(var i=0;i<dataset;i++)
                {
            		tx.executeSql('SELECT * FROM "reponses" WHERE envoi = 0  AND idhoraire = "'+resHoraires.rows.item(i).idhoraire+'";', [], function(tx, res2) {
            			var dataset2 = res2.rows.length;
                        if(dataset2>0)
                        {
                        	aReponses = {};
                        	saveResHorairesID = res2.rows.item(0).idhoraire;
                        	aReponses["sid"] = res2.rows.item(0).sid;
                        	aReponses["timestamp"] = res2.rows.item(0).tsreponse;
                        	if (debug)
                        		alert("reponse à  envoi");
                        	for(var j=0;j<dataset2;j++)
                            {

                                var jsonkey = res2.rows.item(j).sid +"X"+res2.rows.item(j).gid+"X"+res2.rows.item(j).qid;
                        		aReponses[jsonkey]=res2.rows.item(j).reponse;
                            }
                        	console.log("essai envoi"+JSON.stringify(aReponses));
                        	if (debug)
                        		alert("essai envoi"+JSON.stringify(aReponses));
                        	xhr_object = new XMLHttpRequest(); 
                        	xhr_object.open("GET", "http://mcp.ocd-dbs-france.org/mobile/mobilerpc.php?answer="+JSON.stringify(aReponses), false);                	
                        	xhr_object.send(null); 
                        	console.log("send rep");
                        	console.log(xhr_object);
                        	console.log(JSON.stringify(aReponses));
                        	if(xhr_object.readyState == 4) 
                        	{
                        		console.log('Requête effectuée !');
                        		//if(!isMobile) 
                        		//	alert("Requête effectuée !"); 
                        		if(xhr_object.response == "1") 
                        			{
                        			tx.executeSql('UPDATE "reponses" SET envoi = 1 WHERE idhoraire = "'+saveResHorairesID+'";');
                        			console.log('UPDATE "reponses" SET envoi = 1 WHERE idhoraire = "'+saveResHorairesID+'";');
                        			
                        			if (debug)
                        				alert('UPDATE "reponses" SET envoi = 1 WHERE idhoraire = '+saveResHorairesID+';');
                        			}
                        	}
                        	
                        }
            			
            		});
            		
                }
            }
		});
	});
};

function createDeviceID(callback,$scope){
	if (isMobile)
		$scope.deviceID = md5(device.uuid);
	else
		$scope.deviceID = "monDeviceUid";
	callback(null,'deviceID')
}