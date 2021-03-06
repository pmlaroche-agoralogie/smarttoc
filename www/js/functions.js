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
	if (debug || debug_loadDB)
		alertDebug("function init_DB");
	//init base
	if(isMobile)
    	db = window.sqlitePlugin.openDatabase("Database_SmartToc", "1.0", "Demo", -1);
    else
    	db = openDatabase("Database_SmartToc", "1.0", "Demo", -1);
	callback(null,'initDb');
}

function createTableQuestionnaires(callback)
{
	if (debug || debug_loadDB)
		alertDebug("function createTableQuestionnaires");
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

function createTableNotes(callback)
{
	db.transaction(function(tx) 
	{  		
		//tx.executeSql('DROP TABLE IF EXISTS "reponses"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "notes" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "texte" TEXT, "date" INTEGER);');
	},function(tx){callback(true,'createNotesError')},function(tx){callback(null,'createNotesSuccess')});
}


function createQuestionnairesSuccess(callback){
	if (debug || debug_loadDB)
		alertDebug("function createQuestionnairesSuccess");
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
				console.log("Erreur pendant le chargement de la page.\n Ou cas Iphone");
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

function createHorairesSuccess(callback,$interval,$scope)
{
	if (debug || debug_loadDB)
		alertDebug("function createHorairesSuccess");
//	console.log('createHorairesSuccess');
	//tx.executeSql('CREATE TABLE IF NOT EXISTS "horaires" ("id" INTEGER PRIMARY KEY AUTOINCREMENT ,
	//"uidquestionnaire" VARCHAR, "tsdebut" INTEGER, "dureevalidite" INTEGER, "notification" INTEGER, "fait" INTEGER);');      
	if (debug || debug_loadDB)
		alertDebug("avt XMLHttpRequest");
	xhr_object = new XMLHttpRequest(); 
	//xhr_object.timeout = 4000; // Set timeout to 4 seconds (4000 milliseconds)
	if (debug || debug_loadDB)
		alertDebug("https://restitution.altotoc.fr/horaires_smarttocv1.php?uid="+$scope.quiz.deviceID);
	uri="https://restitution.altotoc.fr/horaires_smarttocv1.php?uid="+$scope.quiz.deviceID; 
	if (window.device!=undefined && window.device.platform=="Android") {
		uri="http://restitution.altotoc.fr/horaires_smarttocv1.php?uid="+$scope.quiz.deviceID; 
	}
	xhr_object.open("GET", uri, false); 
	//catch exception no connection
	try {
		xhr_object.send(null);
    } catch(z) {
       // alertNotif("Pas de connexion!\nCertaines fonctions ne seront pas accessibles.")
        callback(null,'noConnexionHoraires');
        getCurrentSID($scope); 
        $interval(function(){ getCurrentSID($scope);}, 60000);
        //$scope.noconnexion = true;
        return;
    }
	//xhr_object.ontimeout = function () { console.log('timeout');$scope.encours = false;callback(null,'idko');}
	//xhr_object.onreadystatechange = function () {
		if(xhr_object.readyState == 4) 
		{
			$scope.noconnexion = false;
			if (debug || debug_loadDB)
				alertDebug("readyState == 4");
			//setTimeout(function() {
			//console.log('Id récupéré !');
			//console.log(xhr_object);
			//console.log(xhr_object.response);
			if (debug || debug_loadDB)
				alertDebug(xhr_object.status);
			if (debug || debug_loadDB)
				alertDebug( JSON.stringify(xhr_object));
			if (debug || debug_loadDB)
				alertDebug(JSON.stringify(xhr_object.response));
			var MyHoraires = JSON.parse(xhr_object.response);
			if (debug || debug_loadDB)
				alertDebug("var MyHoraires");
			db.transaction(function(tx) 
			{  
				if (debug || debug_loadDB)
					alertDebug("transaction");
				for(var k in MyHoraires) {
					/*	if (debug || debug_loadDB)
							alertDebug("for");*/
					   //console.log(k, MyHoraires[k]);
					   //console.log('SELECT COUNT("id") as cnt FROM "horaires" WHERE uidquestionnaire = "'+MyHoraires[k].sid+'" AND tsdebut = '+MyHoraires[k].ts+'');
					   (function (value) { 
					   tx.executeSql('SELECT COUNT("id") as cnt  FROM "horaires" WHERE uidquestionnaire = "'+MyHoraires[k].sid+'" AND tsdebut = '+MyHoraires[k].ts+';', [], function(tx, res) {
						  /* if (debug || debug_loadDB)
								alertDebug("SELECT");*/
						   if (res.rows.item(0).cnt < 1)
						   {
							  /* if (debug || debug_loadDB)
								alertDebug("if SELECT");*/
							   tx.executeSql('INSERT INTO "horaires" (uidquestionnaire, tsdebut,notification,fait) VALUES("'+
									   value.sid+'","'+
									   value.ts+'",0,0);',[], successHandler, errorHandler);
						   }
					   },createQuestionnairesError); //SELECT COUNT
					   })(MyHoraires[k]);
					   
				}
			},function(tx){callback(true,'setHorairesError')},function(tx){callback(null,'setHorairesSuccess');getCurrentSID($scope); $interval(function(){ getCurrentSID($scope);}, 60000); if ($scope.notif) setNotif($scope);});
			//});//DB TRANSACTION
			/*$scope.userId = xhr_object.response;
			$scope.encours = false;
			//$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
			callback(null,'idok');*/
			//},1250);
		}
	//}
}

function createNewHoraires($scope)
{
	
	if (debug || debug_loadDB)
		alertDebug("function createNewHoraires");
//	console.log('createNewHoraires'); 
//	console.log($scope);
	if (debug || debug_loadDB)
		alertDebug("avt XMLHttpRequest createNewHoraires");
	//test si horraires en base
	db.transaction(function(tx) 
	{
		var timestamp = Math.round(new Date().getTime() / 1000);
		tx.executeSql('SELECT COUNT("id") as cnt FROM "horaires" WHERE tsdebut > '+timestamp+' AND fait = 0;', [], function(tx, reshor) 
		{
			if (reshor.rows.item(0).cnt < 1)
			{
				xhr_object = new XMLHttpRequest(); 
				if (debug || debug_loadDB)
					alertDebug("https://restitution.altotoc.fr/horaires_smarttocv1.php?uid="+$scope.quiz.deviceID);
				//xhr_object.open("GET", "https://restitution.altotoc.fr/horaires_smarttocv1.php?uid="+$scope.quiz.deviceID, false); 
				uri="https://restitution.altotoc.fr/horaires_smarttocv1.php?uid="+$scope.quiz.deviceID; 
				if (window.device!=undefined && window.device.platform=="Android") {
					uri="http://restitution.altotoc.fr/horaires_smarttocv1.php?uid="+$scope.quiz.deviceID; 
				}
				xhr_object.open("GET", uri, false);
				//catch exception no connection
				try {
					xhr_object.send(null);
			    } catch(z) {
			    	if ($scope.noconnexion != true)
			    		alertNotif("Pas de connexion!\nCertaines fonctions ne seront pas accessibles.");
			        $scope.noconnexion = true;
			        return;
			    }
				if(xhr_object.readyState == 4) 
				{
					$scope.noconnexion = false;
					if (debug || debug_loadDB)
						alertDebug("readyState == 4");
					//setTimeout(function() {
					console.log('Id récupéré !');
					console.log(xhr_object);
					console.log(xhr_object.response);
					if (debug || debug_loadDB)
						alertDebug(xhr_object.status);
					if (debug || debug_loadDB)
						alertDebug( JSON.stringify(xhr_object));
					if (debug || debug_loadDB)
						alertDebug(JSON.stringify(xhr_object.response));
					var MyHoraires = JSON.parse(xhr_object.response);
					if (debug || debug_loadDB)
						alertDebug("var MyHoraires");
					if (debug || debug_loadDB)
						alertDebug("transaction");
					for(var k in MyHoraires) {
						   console.log(k, MyHoraires[k]);
						   console.log('SELECT COUNT("id") as cnt FROM "horaires" WHERE uidquestionnaire = "'+MyHoraires[k].sid+'" AND tsdebut = '+MyHoraires[k].ts+'');
						   (function (value) { 
							   tx.executeSql('SELECT COUNT("id") as cnt  FROM "horaires" WHERE uidquestionnaire = "'+MyHoraires[k].sid+'" AND tsdebut = '+MyHoraires[k].ts+';', [], function(tx, res) {
								   if (res.rows.item(0).cnt < 1)
								   {
									   tx.executeSql('INSERT INTO "horaires" (uidquestionnaire, tsdebut,notification,fait) VALUES("'+
											   value.sid+'","'+
											   value.ts+'",0,0);',[], successHandler, errorHandler);
								   }
							   },createQuestionnairesError); //SELECT COUNT
						   })(MyHoraires[k]);
						   
					}		
				}
			}
			else
			{
				//console.log('reste hor');
			}
			//FIN if no horaires
		});//FIN SELECT
	});//FIN TRABSACTION
}


function createQuestionnairesError(tx, error) {
    console.log("createQuestionnairesError: " + error.message);
}

function readQuestionnairesSuccess(fileEntry,callback) {
	if (debug || debug_loadDB)
		alertDebug("function readQuestionnairesSuccess");
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
	if (debug || debug_loadDB)
		alertDebug("function insertQuestionnaire");
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
		alertDebug("function getQuestionsBySID");
	console.log('*******getQuestionsBySID******');
	db.transaction(function(tx) {
		console.log('SELECT * FROM "questionnaires" WHERE sid = '+sid+' LIMIT '+current+',1;');
		tx.executeSql('SELECT * FROM "questionnaires" WHERE sid = '+sid+' LIMIT '+current+',1;', [], function(tx, res) {
			if (debug)
				alert('getQuestionsBySID');
			if (debug) alert('scope getQuestionsByGroupe1');
			if (debug) alert(JSON.stringify($scope.quiz));
			console.log('question');
			//console.log(res);
			//if (res.rows.item(0).cnt < 1)
			if (res.rows.length < 1)
			{
				//var currentSID = ;
				//var currentHoraire = 
				if ($scope.quiz.sid != quiz_profile)
				{
					var currentSID = $scope.quiz.currentSID;
					var currentHoraire = $scope.quiz.currentHoraire;
					console.log('UPDATE "horaires" SET fait = 1 WHERE uidquestionnaire ="'+currentSID+'" AND tsdebut = '+currentHoraire+';');
					tx.executeSql('UPDATE "horaires" SET fait = 1 WHERE uidquestionnaire ="'+currentSID+'" AND tsdebut = '+currentHoraire+';');
					
					//unset notif if timestamp pas passé
					var timestamp = Math.round(new Date().getTime() / 1000);
					console.log('timestamp');
					console.log(timestamp);
					console.log(currentHoraire);
					if (currentHoraire > timestamp)
					{
						console.log('notif active');
						tx.executeSql('SELECT * FROM "horaires" WHERE uidquestionnaire ="'+currentSID+'" AND tsdebut = '+currentHoraire+';', [], function(tx, resnotifsup) {
							console.log('notif desactive');
							console.log(resnotifsup.rows.item(0).id);
							if (isMobile)
							{
								monID = parseInt(resnotifsup.rows.item(0).id,10);
								window.cordova.plugins.notification.local.cancel(monID);
							}
								
						});//fin SELECT
					}
				}
				console.log('fin');
				$scope.quiz.groupes ={};
				$scope.quiz.next =0;
				$scope.quiz.actif = 'fin';
				getCurrentSID($scope);
				//$scope.quiz.currentSID = "none";
				//$scope.quiz.currentHoraire = "none";
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
				next = parseInt(current) + 1;
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

function getQuestionList($scope,sid,callback){
	if (debug)
		alertDebug("function getQuestionList");
	//questionslist
	if ($scope.questionslist === undefined)
		$scope.questionslist = [];
	db.transaction(function(tx) {
//		console.log('SELECT * FROM "questionnaires" WHERE sid = '+sid+';');
		tx.executeSql('SELECT * FROM "questionnaires" WHERE sid = '+sid+';', [], function(tx, res) {
			//console.log(res);
			//console.log(res.rows.length);
			for (var i = 0; i < res.rows.length; i++) {
				$scope.questionslist[$scope.questionslist.length]=res.rows.item(i);
				if (i == (res.rows.length-1))
				{
					//console.log('fin');
					callback(null,'questionList '+sid);
				}
			}
		});//FIN SELECT
	});//FIN transaction
}

function displayQuestionTemplate($route,$location,$scope,sid,current){
	if (debug)
		alertDebug("function displayQuestionTemplate");
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

// CURRENT SURVEY
function getCurrentSID($scope)
{
	
	if (debug)
		alertDebug("function getCurrentSID");
//	console.log('getCurrentSID1');
	//console.log($scope);
	/*$scope.currentSID = "none";
	$scope.currentHoraire = "none";*/
	var mycurrentDate = new Date();
	//console.log('getCurrentSID2');
	if (parseInt(mycurrentDate.getHours() )> 5)
	{
		var timestamp1 = Math.round(new Date(mycurrentDate.getFullYear(), mycurrentDate.getMonth(), mycurrentDate.getDate()).getTime() / 1000);
		var timestamp2 = timestamp1 + 86400;
		//console.log(timestamp1);
		//console.log(timestamp2);
		
		db.transaction(function(tx) {
			//tx.executeSql('SELECT * FROM "horaires" WHERE tsdebut >= '+timestamp1+' AND tsdebut < '+timestamp2+' AND fait = 0 ORDER BY tsdebut ASC LIMIT 0,1;', [], function(tx, res) {	
			tx.executeSql('SELECT * FROM "horaires" WHERE tsdebut >= '+timestamp1+' AND tsdebut < '+timestamp2+' ORDER BY tsdebut ASC LIMIT 0,1;', [], function(tx, res) {	
				var dataset = res.rows.length;
				if (dataset > 0)
				{
					//alert('current');
					//test si fait ou non
					if (res.rows.item(0).fait == 0)
					{
					$scope.quiz.currentSID = res.rows.item(0).uidquestionnaire;
					$scope.quiz.currentHoraire = res.rows.item(0).tsdebut;		
					$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
					}
					else
					{
						//alert('no current');
						$scope.quiz.currentSID = "none";
						$scope.quiz.currentHoraire = "done";	
					}
						
				}
				else
				{
					//alert('no current');
					$scope.quiz.currentSID = "none";
					$scope.quiz.currentHoraire = "none";	
				}
			});//FIN SELECT
		});//FIN transaction
	}
	else
	{
		//alert('no current 2');
		$scope.quiz.currentSID = "none";
		$scope.quiz.currentHoraire = "forbidden";	
	}
	createNewHoraires($scope);
}

function saveReponses(quiz,callback)
{
	if (debug)
		alertDebug("function saveReponses");
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
			else if ((groupe.config.tpl == 'radio') 
					|| (groupe.config.tpl == 'radio2')
					|| (groupe.config.tpl == 'radio_demo_genre'))
			{
				
				console.log('save radio');
				reponse = $('.question[monID="'+groupe.qid+'"] input:checked').val();
			}
			else if ((groupe.config.tpl == 'sl1') 
					|| (groupe.config.tpl == 'sl2')
					|| (groupe.config.tpl == 'sl3')
					|| (groupe.config.tpl == 'sl4')
					|| (groupe.config.tpl == 'sl5')
					|| (groupe.config.tpl == 'sl6')
					|| (groupe.config.tpl == 'sl7')
					|| (groupe.config.tpl == 'sl8')
					|| (groupe.config.tpl == 'sl9')
					|| (groupe.config.tpl == 'sl10')
					|| (groupe.config.tpl == 'sl11')
					|| (groupe.config.tpl == 'sl12')
					|| (groupe.config.tpl == 'sl13')
				)
			{
				console.log('save slider');
				reponse = $('.question[monID="'+groupe.qid+'"] input').val();
			}
			else if (groupe.config.tpl == 'uid') 
			{
				console.log('save uid');
				reponse = quiz.deviceID
			}
			else
			{
				
				console.log('save radio');
				reponse = $('.question[monID="'+groupe.qid+'"] input:checked').val();
			}
			
			if (groupe.sid == quiz_profile)
				var horaire = "profile";
			else
				var horaire = quiz.currentHoraire;
			
			//sql ='INSERT INTO "reponses" (idhoraire,sid, gid,qid, reponse, tsreponse_deb,tsreponse_fin) '+
			sql ='INSERT INTO "reponses" (idhoraire,sid, gid,qid, reponse,tsreponse) '+
			
			'VALUES('+
			//'"'+quiz.uuid+'",'+ //uuid
			'"'+horaire+'",'+ //idHoraire
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

/////////////////////////////////////////////////////////////////////
//Functions Notes
/////////////////////////////////////////////////////////////////////

function saveNote($scope)
{
	var date = Math.round(new Date().getTime() / 1000);
	sql ='INSERT INTO "notes" (texte,date) '+
	'VALUES('+
	'"'+$scope.mynote+'",'+ //idHoraire
	''+date+''+ //timestamp note
	');';
	console.log($scope.notes.length);
	$scope.notes[$scope.notes.length] = {"date":date, "texte":$scope.mynote};
	//$scope.notes[$scope.notes.length].date = date;
	//$scope.notes[$scope.notes.length].texte = $scope.mynote;
	console.log($scope);
	console.log(sql);
	if (sql != "")
	{

		db.transaction(function(tx) {
			(function (reqSql) { 
				tx.executeSql(reqSql,[], function(tx, result){successHandler(tx, result);$scope.mynote = "";$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});}, errorHandler);// requête
			})(sql);
		});
	
	}
}

function getNotes($scope)
{
	if ($scope.$parent.notes === undefined)
		$scope.$parent.notes = [];	
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "notes" ORDER BY date ASC;', [], function(tx, res) {	
			var dataset = res.rows.length;
			if (dataset > 0)
			{
				$scope.$parent.notes = [];
				for (var i = 0; i < res.rows.length; i++) {
					$scope.$parent.notes[i]=res.rows.item(i);
				}
				//$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
				console.log($scope);
				console.log("notes");
				
			}
			else
			{
				$scope.$parent.notes = [];
				//$scope.$parent.notes = "none";	
			}
		});//FIN SELECT
	},function(tx){$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});},function(tx){$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});});// DB TRANSACTION
	//});//FIN transaction
}

function getNotesHTML($scope)
{
	var notesHTML = "";
	for (var i = 0; i < $scope.notes.length; i++) {
		notesHTML += '<div style="padding-bottom:10px;text-align:left;"><div style="font-weight:bold">'+convertTsToDate($scope.notes[i].date)+'</div><div style="padding:10px;">'+convertTextToDisplayText($scope.notes[i].texte)+'</div></div>';
	}
	console.log(notesHTML);
	return notesHTML;
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
	if (debug)
		alertDebug("function do_MC_UseOk");
	//console.log('do_MC_UseOk');
	if (MC_UseOk)
	{
		//console.log('MC_UseOk');
		db.transaction(function(tx) 
		{
			(function ($location,$scope) { 
				//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
				tx.executeSql('SELECT * FROM "reponses" where sid = "useOK" AND reponse = "ok";', [], function(tx, res) {
					//console.log(res);
					var dataset = res.rows.length;
		            if(dataset<1)
					//if (res.rows.item(0).cnt < 1)
					{
						//console.log('MC_UseOk:false');
						//Change path
						$location.path('/useok'); 
						$scope.menu = false;
						$route.reload();
						$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
						
						//callback(true,"MC_UseOk_false");
						//return false;
					}
					else
					{
						//console.log('MC_UseOk:true');
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
	if (debug)
		alertDebug("function MC_ProfileOk");
//function MC_ProfileOk($location,$route){
	if (MC_ProfileOk)
	{
		//console.log('MC_ProfileOk');
		db.transaction(function(tx) 
		{
			(function ($location,$scope) { 
				//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
				tx.executeSql('SELECT * FROM "reponses" where sid = "'+quiz_profile+'" AND reponse = "done";', [], function(tx, res) {
					//console.log(res);
					var dataset = res.rows.length;
		            if(dataset<1)
					//if (res.rows.item(0).cnt < 1)
					{
						//console.log('MC_ProfileOk:false');
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
						//console.log('MC_ProfileOk:true');
						//Change path
						$location.path('/'); 
						sendReponses($scope);
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
		sendReponses($scope);
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
//Functions Notif
/////////////////////////////////////////////////////////////////////

//Function affichage notif
function alertNotif(message)
{
	if (isMobile)
	navigator.notification.alert(
			message,  // message
		    function(){},         // callback
		    "Smart'TOC",            // title
		    'Ok'                  // buttonName
		);
	else
		alert(message);
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

function convertTsToDate(ts){
	currentDate = new Date(ts*1000);
	date = convertToStrDay(currentDate.getDay())+" "+currentDate.getDate()+" "+convertToStrMonth(currentDate.getMonth())+" "+currentDate.getFullYear()+" à "+('0' + currentDate.getHours()).slice(-2)+":"+('0' + currentDate.getMinutes()).slice(-2);

	
	return date;
}
function convertTextToDisplayText(text){
	//return text;
	return text.replace("\n", "<br/>");
}



function convertToStrDay(day){
	var jours = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
	return jours[day];
	
}

function convertToStrMonth(month){
	var mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
	return mois[month];
	
}


// DEVICE ID
function createDeviceID(callback,$scope){
	if (debug)
		alertDebug("function createDeviceID");
//	console.log('createDeviceID');
	if ($scope.quiz === undefined)
		$scope.quiz ={};

	if (isMobile)
		$scope.quiz.deviceID = md5(device.uuid);
	else

		$scope.quiz.deviceID = "monDeviceUid7";
	
	//largeur /hauteur pour test
	if (document.body)
	{
		$scope.larg = (document.body.clientWidth);
		$scope.haut = (document.body.clientHeight);
		$scope.body = $('body').height();
		$scope.cas = 'document.body';
	}
	else
	{
		$scope.larg = (window.innerWidth);
		$scope.haut = (window.innerHeight);
		$scope.cas = 'window';
	}
	
	callback(null,'deviceID')
}

//UUID
function generateUUID() {
	if (debug)
		alertDebug("function generateUUID");
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

//ENVOI REPONSES
function sendReponses($scope) {
	//console.log('send');
	//console.log($scope);
	var aReponses ={};
	db.transaction(function(tx) {

		tx.executeSql('SELECT DISTINCT idhoraire FROM "reponses" WHERE envoi = 0', [], function(tx, resHoraires) {
			
			var dataset = resHoraires.rows.length;
			//console.log(resHoraires);
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

                        	xhr_object = new XMLHttpRequest(); 
                        	//xhr_object.open("GET", "http://mcp.ocd-dbs-france.org/mobile/mobilerpc.php?answer="+JSON.stringify(aReponses), false);   
                        	//xhr_object.open("GET", "https://restitution.altotoc.fr/mobile/mobilerpc.php?answer="+JSON.stringify(aReponses), false); 
                        	uri="https://restitution.altotoc.fr/mobile/mobilerpc.php?answer="+JSON.stringify(aReponses); 
                        	if (window.device!=undefined && window.device.platform=="Android") {
                        		uri="http://restitution.altotoc.fr/mobile/mobilerpc.php?answer="+JSON.stringify(aReponses); 
                        	}
                        	xhr_object.open("GET", uri, false);
         
                        	//xhr_object.send(null); 
                        	//exception connection
                        	try {
                        		xhr_object.send(null);
                            } catch(z) {
                            	if ($scope.noconnexion != true)
                            		alertNotif("Pas de connexion!\nPas d'envoi des réponses.");
                                $scope.noconnexion = true;
                                return;
                            }
                        	console.log("send rep");
                        	console.log(JSON.stringify(aReponses));
                        	if(xhr_object.readyState == 4) 
                        	{
                        		$scope.noconnexion = false;
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

//NOTIFICATIONS
function checkNotif(callback,$scope)
{
	/*db.transaction(function(tx) 
			{
				tx.executeSql('INSERT INTO "reponses" (sid, reponse,envoi) VALUES ("notif",1,1)');
			}); //fin db.transaction
*/
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "reponses" WHERE sid = "notif";', [], function(tx, resnotif) {
			var dataset = resnotif.rows.length;
            if(dataset>0)
            {     	
            	if (resnotif.rows.item(0).reponse == "1")
            		$scope.notif=true;
            	else
            		$scope.notif=false;
            }
            else
            {
            	tx.executeSql('INSERT INTO "reponses" (sid, reponse,envoi) VALUES ("notif","1",1)');
            	$scope.notif=true;
            }
		});// FIN SELECT
	},function(tx){callback(true,'errCheckNotif')},function(tx){callback(null,'CheckNotif')}); //FIN transaction
            	

}

function setNotif($scope)
{
//	console.log('function setNotif');
	var timestamp = Math.round(new Date().getTime() / 1000);
	//console.log(timestamp);
	
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "horaires" WHERE tsdebut > '+timestamp+' AND notification = 0 AND fait = 0 ORDER BY tsdebut ASC;', [], function(tx, resnotif) {
			var dataset = resnotif.rows.length;
            if(dataset>0)
            {     	
            	$scope.notif=true;
            	tx.executeSql('UPDATE "reponses" SET reponse = "1" WHERE sid="notif";');
            	$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
            	var aNotif = [];
            	for(var i=0;i<dataset;i++)
                {
            		console.log('')
            		//console.log(resnotif.rows.item(0).id+'+'+resnotif.rows.item(0).tsdebut+'>'+timestampNow);
					_timestampSessionNotif = new Date(resnotif.rows.item(i).tsdebut*1000);
					var monId = parseInt(resnotif.rows.item(i).id,10);
					tx.executeSql('UPDATE "horaires" SET notification = 1 WHERE id = '+monId+';');
					aNotif[i] = {
	                           id:      monId,
	                           title:   "Smart'TOC",
	                           //message: 'test '+resnotif.rows.item(0).id+': Merci de répondre au questionnaire de l application de suivi.',
	                           text: "Merci de répondre au questionnaire de l application Smart'TOC.",
	                           at:    _timestampSessionNotif
	                           };
                }
            	if (isMobile) //envoi notif
				{
            		window.cordova.plugins.notification.local.schedule(aNotif);
            		console.log('notification : ');
					console.log(aNotif);
				}
				else //log notif
				{
					console.log('notification : ');
					console.log(aNotif);
				}
            }
		});//FIN SELECT
	});//FIN transaction
}

function deleteNotif($scope)
{
	console.log('function deleteNotif');
	var canceltimestamp = Math.round(new Date().getTime() / 1000);
	console.log(canceltimestamp);
	
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "horaires" WHERE tsdebut > '+canceltimestamp+' AND notification = 1 AND fait = 0 ORDER BY tsdebut ASC;', [], function(tx, resnotif) {
			var dataset = resnotif.rows.length;
            if(dataset>0)
            {     	
            	$scope.notif=false;
            	tx.executeSql('UPDATE "reponses" SET reponse = "0" WHERE sid="notif";');
            	$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
            	if (isMobile)
            		window.cordova.plugins.notification.local.cancelAll();
            	else
            		console.log('notification sup');
            	tx.executeSql('UPDATE "horaires" SET notification = 0 WHERE tsdebut > '+canceltimestamp+' AND notification = 1 AND fait = 0;');
            }
		});//FIN SELECT
	});//FIN transaction
}