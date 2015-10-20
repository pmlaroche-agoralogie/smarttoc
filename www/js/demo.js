// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('MobileAngularUiExamples', [
  'Cordova',                                                   
  'ngRoute',
  'ngSanitize',
  'mobile-angular-ui',
  
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures',
  'starter.services'
  
]);


// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'templates/home.html', reloadOnSearch: false});
 /* $routeProvider.when('/scroll',        {templateUrl: 'templates/scroll.html', reloadOnSearch: false}); 
  $routeProvider.when('/toggle',        {templateUrl: 'templates/toggle.html', reloadOnSearch: false}); 
  $routeProvider.when('/tabs',          {templateUrl: 'templates/tabs.html', reloadOnSearch: false}); 
  $routeProvider.when('/accordion',     {templateUrl: 'templates/accordion.html', reloadOnSearch: false}); 
  $routeProvider.when('/overlay',       {templateUrl: 'templates/overlay.html', reloadOnSearch: false}); 
  $routeProvider.when('/forms',         {templateUrl: 'templates/forms.html', reloadOnSearch: false});
  $routeProvider.when('/dropdown',      {templateUrl: 'templates/dropdown.html', reloadOnSearch: false});
  $routeProvider.when('/drag',          {templateUrl: 'templates/drag.html', reloadOnSearch: false});
  $routeProvider.when('/carousel',      {templateUrl: 'templates/carousel.html', reloadOnSearch: false});*/
  $routeProvider.when('/useok',      	{templateUrl: 'templates/useok.html', reloadOnSearch: false});
  $routeProvider.when('/profileok',     {templateUrl: 'templates/profileok.html', reloadOnSearch: false});
  $routeProvider.when('/quizProfile',   {templateUrl: 'templates/quizprofile.html', reloadOnSearch: false});
  $routeProvider.when('/quiz',     		{templateUrl: 'templates/quiz.html', reloadOnSearch: false});
  $routeProvider.when('/results',     	{templateUrl: 'templates/results.html', reloadOnSearch: false});
  $routeProvider.when('/journal',     	{templateUrl: 'templates/journal.html', reloadOnSearch: false});
  $routeProvider.when('/notif',     	{templateUrl: 'templates/notif.html', reloadOnSearch: false});
  $routeProvider.when('/sendResults',    {templateUrl: 'templates/sendresults.html', reloadOnSearch: false});
  $routeProvider.when('/tab-charts',    {templateUrl: 'templates/tab-charts.html', reloadOnSearch: false});
});

app.controller('MainController', function(cordovaReady,$rootScope, $scope,$location,$route,$sanitize,$sce){
	
	$scope.test ="test";
	$scope.menu = false;
	
	
	//Séquence d'initialisation
	async.series([	
	              	function(callback){ cordovaReady(callback);},
	              	function(callback){init_DB(callback);},
	               		
	              	//create tables
	              	function(callback){createTableQuestionnaires(callback);},
	              	function(callback){createTableHoraires(callback);},
	              	function(callback){createTableReponses(callback);},
		               	
	              	//create db content
	              	function(callback){createQuestionnairesSuccess(callback);},
	              	//function(callback){createHorairesSuccess(callback);},
	              	//TODO : horaires
	              	
	              	//create deviceID
	              	function(callback){createDeviceID(callback,$scope);},
	              	
	              	//test useOk
	              	function(callback){do_MC_UseOk(callback,$location,$route,$scope);},
	        ],	   				 
			function(err, results ){
		
					console.log(results);
			}
		);//fin  async.series*/
	 
	
	$scope.toTrustedHTML = function( html ){
	    return $sce.trustAsHtml( html );
	}
	 
	/////////////
	//BUTTON USE 
	$scope.useClick = function(clickEvent){
		if ($('input[name="useanswer"]:checked').val() == "useOK")
		{
			console.log('useOK');
			//save in BDD
			save_MC_UseOk();
			//Et suite
			MC_ProfileOk(false,$location,$route,$scope);
		}
		else
		{
			//TODO : Page d'information
			console.log('useKO');
			if(isMobile)
			{
				console.log('device exit?');
				if(navigator.app){console.log('navigator.app');
					navigator.app.exitApp();
				}else if(navigator.device){
					console.log('navigator.device');
					navigator.device.exitApp();
				}
			}
		}
		//save in BDD
		/*save_MC_UseOk();
		//Et suite
		MC_ProfileOk(false,$location,$route,$scope);*/
	};
	
	
	/////////////
	//BUTTON USE OK
	$scope.useOK = function(clickEvent){
		console.log('useOK');
		//save in BDD
		save_MC_UseOk();
		//Et suite
		MC_ProfileOk(false,$location,$route,$scope);
	};
	
	/////////////
	//BUTTON USE KO
	$scope.useKO = function(clickEvent){
		//TODO : Page d'information
		console.log('useKO');
		if(isMobile)
		{
			console.log('device exit?');
			if(navigator.app){console.log('navigator.app');
				navigator.app.exitApp();
			}else if(navigator.device){
				console.log('navigator.device');
				navigator.device.exitApp();
			}
		}
	};
	
	/////////////
	//BUTTON NEXT PROFILE
	$scope.nextProfile = function(clickEvent){
		console.log('nextProfile');
		if ($scope.profileok == "page1")
			$scope.profileok = "page4";
		/*else if ($scope.profileok == "page2")
			$scope.profileok = "page3";
		else if ($scope.profileok == "page3")
			$scope.profileok = "page4";*/
		else if ($scope.profileok == "page4")
		{
			$scope.profileok = "quiz";
			if ($scope.quiz === undefined)
				$scope.quiz ={};
			if ($scope.quiz.sid === undefined || $scope.quiz.sid != quiz_profile)
				$scope.quiz.sid = quiz_profile;
			$scope.quiz.actif = true;
			
			//temp remplace horaire
			$scope.quiz.uuid = generateUUID();
			displayQuestionTemplate($route,$location,$scope,$scope.quiz.sid,0);
			//Change path
			$location.path('/quizProfile'); 
			$scope.menu = false;
			$route.reload();
		}
		else if ($scope.profileok == "page5")
		{
			$scope.profileok = "page6";
		}
		else if ($scope.profileok == "page6")
		{
			$location.path('/'); 
			sendReponses();
			$scope.menu = true;
			$route.reload();
		}
		/*else if ($scope.profileok = "quiz")
		{
			if ($scope.quiz === undefined)
				$scope.quiz ={};
			console.log("quiz");
			if ($scope.quiz.sid === undefined || $scope.quiz.sid != quiz_profile)
				$scope.quiz.sid = quiz_profile;
			console.log('SCOPE2');
			console.log(JSON.stringify($scope.quiz));

		}*/
		if (debug) alert(JSON.stringify($scope.quiz));
		console.log('SCOPE');
		console.log(JSON.stringify($scope.quiz));
			
			
	}//FIN BUTTON NEXT PROFILE
	
	/////////////
	//BUTTON ENVOI IDENTIFIANT
	$scope.emailDeviceId = function(clickEvent){
		console.log('emailDeviceId');
		cordova.plugins.email.isAvailable(function(result){ 
        	if (result) //mail dispo
        	{
        		cordova.plugins.email.open({
        			subject: "Votre identifiant Smart'TOC",
        			body:     'Votre idendifient : '+$scope.deviceID //=> res/drawable/icon (Android)
        		});
        	}
        });
	}
	
	/////////////
	//BUTTON START QUOTI
	$scope.startQuoti = function(clickEvent){
		if ($scope.quiz === undefined)
			$scope.quiz ={};
		$scope.quiz.actif = true;
		if ($scope.quiz.sid === undefined || $scope.quiz.sid != quiz_quotidien)
			$scope.quiz.sid = quiz_quotidien;
		$scope.quiz.actif = true;
		console.log('startQuoti');
		console.log($scope);
		
		//temp remplace horaire
		$scope.quiz.uuid = generateUUID();
		displayQuestionTemplate($route,$location,$scope,$scope.quiz.sid,0);
		//Change path
		$location.path('/quiz'); 
		$scope.menu = false;
		$route.reload();
		
	}// fin startQuoti
	
	
	/////////////
	//BUTTON START HEBDO
	$scope.startHebdo = function(clickEvent){
		if ($scope.quiz === undefined)
			$scope.quiz ={};
		$scope.quiz.actif = true;
		if ($scope.quiz.sid === undefined || $scope.quiz.sid != quiz_hebdo)
			$scope.quiz.sid = quiz_hebdo;
		
		//temp remplace horaire
		$scope.quiz.uuid = generateUUID();
		displayQuestionTemplate($route,$location,$scope,$scope.quiz.sid,0);
		//Change path
		$location.path('/quiz'); 
		$scope.menu = false;
		$route.reload();
		
	}// fin startQuoti
	
	
	/////////////
	//BUTTON NEXT Quiz
	$scope.nextQuiz = function(clickEvent){
			//save
			quiz = $scope.quiz;
			async.series([	
			              function(callback){ saveReponses(quiz,callback);},
		               	],
		   				 
               		function(err, results ){		 	
							$( "input" ).prop( "checked", false );
							displayQuestionTemplate($route,$location,$scope,$scope.quiz.sid,$scope.quiz.next);
   			 			console.log(results);
   		         }
   		 );//fin  async.series
			/*console.log($("input[name="+res.rows.item(current).qid+"]:checked").attr("value"));
			rep = $("input[name="+res.rows.item(current).qid+"]:checked").attr("value");*/
		//	var timestamp = Math.round(new Date().getTime() / 1000);
		/*	db.transaction(function(tx) 
					{
							//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
							tx.executeSql('INSERT INTO "reponses" (sid, gid,qid, reponse,tsreponse) VALUES ("'+res.rows.item(current).sid+'","'+res.rows.item(current).gid+'","'+res.rows.item(current).qid+'","'+rep+'","'+timestamp+'");', [], function(tx, res) {});//insert
					});//Transaction*/		

		}//FIN BUTTON NEXT Quiz
	
	$scope.changetoHour  = function(string){
		if (string !== undefined)
		{
			var h = Math.floor(parseInt(string)/2) + "h";
			var m = (parseInt(string)%2==1?"30min":"00");
			return h+m;
		}
		else
		{
			return "0h00";
		}
	}

	$scope.finQuiz = function(clickEvent){
		$location.path('/'); 
		sendReponses();
		$scope.menu = true;
		$route.reload();
	}
	
	/////////////
	//BUTTON ENVOYER MAIL
	$scope.sendMail= function(clickEvent){
		if(isMobile)
		{
		var fileTransfer = new FileTransfer();
		var fileURL = cordova.file.dataDirectory+"montest.pdf";
		//test android seulement :
		var fileURL = "cdvfile://localhost/persistent/"+"mesdonnees.pdf"; 
		//var uri = "http://restitution.altotoc.fr/pdf?curs=2015-01-01&sid=236551&qid="+questionList; //modif php pour repondre qqchose par defaut si pas de param
		var uri = "http://restitution.altotoc.fr/pdf?sid=916553&curs=2015-01-01"; //modif php pour repondre qqchose par defaut si pas de param
			
		fileTransfer.download(
			    uri,
			    fileURL,
			    function(entry) {
			        console.log("download complete: " + entry.toURL());
			        //envoi mail
			       alert("download complete: " + entry.toURL());
			        cordova.plugins.email.isAvailable(function(result){ 
			        	if (result) //mail dispo
			        	{
			        		cordova.plugins.email.open({
			        			subject: 'rapport données',
			        		    attachments: entry.toURL() //=> res/drawable/icon (Android)
			        		});
			        	}
			        });
			    },
			    function(error) {
			    	//alert("download error source " + error.source);
			    	//alert("download error target " + error.target);
			    	//alert("upload error code" + error.code);
			        //console.log("download error source " + error.source);
			        //console.log("download error target " + error.target);
			        //console.log("upload error code" + error.code);
			    },
			    false,
			    {
			        headers: {
			            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
			        }
			    }
			);
	}
		else
			console.log("emailMe");
		/*$location.path('/'); 
		sendReponses();
		$scope.menu = true;
		$route.reload();*/
	}//FIN BUTTON ENVOYER MAIL

}); // fin MainController


//CHARTS
app.controller('ChartsCtrl', function($scope, $filter, Questions, Charts) {

	//current date
	var MyDate = new Date();
	var MyDateString;
	MyDate.setDate(MyDate.getDate() + 20);
	MyDateString =  MyDate.getFullYear() + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + ('0' + MyDate.getDate()).slice(-2);
	
	
	var sid = 236551;
	moment.locale('fr');
	var curs = moment(MyDateString);
	var curs = moment('2015-01-01');
     period = "1-month";
     
     $scope.openResultUrl = function(clickEvent){
 		console.log('openUrl');
 		//var iabRef = window.open('http://icm.kpy.fr/?sid=236551&curs=2015-01-01&period=m', '_blank', 'location=no,closebuttoncaption=Fermer');
 		var iabRef = window.open('http://restitution.altotoc.fr/?sid=236551&curs=2015-01-01&period=m', '_blank', 'location=no,closebuttoncaption=Fermer');
 		/*iabRef.insertCSS({
            code: "body { background: #ffff00; }"
        }, function() {
            alert("Styles Altered");
        });*/
 		//iabRef.toolbar.barStyle = UIBarStyleDefault;
 	};
	
	/*  $scope.$on('mobile-angular-ui.state.changed.activeTab', function(e, newVal, oldVal) {
		  
		  if (newVal == 1) {
			   period = "1-month";
		  } 
		  else  if (newVal == 2) {
			   period = "2-month";
		  }
		  else  if (newVal == 3) {
			   period = "3-month";
		  }*/

	var grid = [],
		labels = [];
	if (period == 'weeks') {
		var _in = moment(curs).startOf('isoWeek');
		var _out = moment(curs).endOf('isoWeek');
		var d = moment(_in);
		labels = ['L','M','Me','J','V','S','D'];
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			d = d.add(1, 'days');
		}
	} else if (period == '1-month') {
		var _in = moment(curs).startOf('month');
		var _out = moment(curs).endOf('month');
		var d = moment(_in);
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			labels.push((d.format('e')=='0')?d.format('dd D MMM'):'');
			d = d.add(1, 'days');
		}
	} else if (period == '2-month') {
		var _in = moment(curs).startOf('month').subtract('months',1);
		var _out = moment(curs).endOf('month');
		var d = moment(_in);
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			labels.push((d.format('e')=='0')?d.format('dd D MMM'):'');
			d = d.add(1, 'days');
		}
	} else if (period == '3-month') {
		var _in = moment(curs).startOf('month').subtract('months',2);
		var _out = moment(curs).endOf('month');
		var d = moment(_in);
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			labels.push((d.format('e')=='0')?d.format('dd D MMM'):'');
			d = d.add(1, 'days');
		}
	}
	
	console.log('Questions');
	console.log(Questions);
	
	Questions.all({sid:sid}).then(function(response) {
		var q = [];
		angular.forEach(response.data, function(row) {
			if (row.question != "systemuid") {
				q.push({
					label: row.question.replace(/(<([^>]+)>)/ig,"").replace(/\&nbsp;/ig," ").trim(),
					key: sid+'X'+row.gid+'X'+row.qid
				});
			}
		});
		q.push(q.shift()); // first and second at the end (demo)
		q.push(q.shift());
		$scope.questions = q;
		console.log('$scope.questions');
		console.log($scope.questions);
		//Chart.defaults.global = {
		//responsive: false,
	 //   maintainAspectRatio: true
//}
		
		Charts.all({sid:sid,in:_in.format('YYYY-MM-DD'),out:_out.format('YYYY-MM-DD')}).then(function(response) {
			q.forEach(function(question,i) {
				var el = document.getElementById('chart-'+question.key);
				if (el) {
					var data = {};
					grid.forEach(function(date) {
						data[date] = null;
					});
					angular.forEach(response.data, function(row) {
					//response.data.forEach(function(row) {
						if (row[question.key]) {
							data[row['submitdate'].substr(0,10)] = row[question.key];
						}
					});;
					var strokeColor = "#FFFFFF";
					if (period == '1-month')
						strokeColor = "#157EFB";
					new Chart(el.getContext("2d")).Bar({
						labels: labels,
						datasets: [
							{
								fillColor: "#157EFB",
								strokeColor: strokeColor,
								barStrokeWidth: 1,
								barShowStroke : false,
								barValueSpacing : 1,
								data:data
							}
						]
					}, {
						animation:(i<3)
					});
				}
			});
			
			//$scope.charts = response.data;
		});
		
		
		
		$scope.emailMe = function(clickEvent){
		var questionList = "";
		$( "input:checked").each(function( index ) {
			  console.log( index + ": " + $( this ).attr('id') );
			 // console.log($("input:checked"));
			  var str = $( this ).attr('id');
			  var res = str.split("X");
			  console.log(res);
			  var res2 = res[2];
			  console.log(res2);
			  questionList += res[2]+",";
			});
		console.log(questionList);
			if(isMobile)
			{
			var fileTransfer = new FileTransfer();
			var fileURL = cordova.file.dataDirectory+"montest.pdf";
			//test android seulement :
			var fileURL = "cdvfile://localhost/persistent/"+"mesdonnees.pdf"; 
			var uri = "http://restitution.altotoc.fr/pdf?curs=2015-01-01&sid=236551&qid="+questionList; //modif php pour repondre qqchose par defaut si pas de param
			fileTransfer.download(
				    uri,
				    fileURL,
				    function(entry) {
				        console.log("download complete: " + entry.toURL());
				        //envoi mail
				       alert("download complete: " + entry.toURL());
				        cordova.plugins.email.isAvailable(function(result){ 
				        	if (result) //mail dispo
				        	{
				        		cordova.plugins.email.open({
				        			subject: 'rapport données',
				        		    attachments: entry.toURL() //=> res/drawable/icon (Android)
				        		});
				        	}
				        });
				    },
				    function(error) {
				    	//alert("download error source " + error.source);
				    	//alert("download error target " + error.target);
				    	//alert("upload error code" + error.code);
				        //console.log("download error source " + error.source);
				        //console.log("download error target " + error.target);
				        //console.log("upload error code" + error.code);
				    },
				    false,
				    {
				        headers: {
				            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
				        }
				    }
				);
		}
			else
				console.log("emailMe");
		}
	});
	
	 // });// $scope.$on
});


//DYN TEMPLATE
/**GESTION TEMPLATE DYN **/
app.directive("groupe", function() {
	return {
	    template: '<ng-include src="getTemplateUrl()"/>',
	    //scope: {},
    	//transclude: true,
	    /*scope: {
	      groupe: '=data'
	    },*/
	    scope: true,
	    restrict: 'E',
	  //  scope: true,
	    controller: function($scope, $element, $attrs) {
	      //function used on the ng-include to resolve the template
	      $scope.getTemplateUrl = function() {
	    	  console.log('template dyn');
	        //switch template
	        if ($scope.groupe.qtype == "N")
	        {
	        	
	        	if ($scope.groupe.config.tpl == "libre_age")
	        		return "templates/tpl_libre_age.tpl.html";
	        	if ($scope.groupe.config.tpl == "radio")
	        		return "templates/tpl_radio.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl1")
		        	return "templates/tpl_sl1.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl2")
		        	return "templates/tpl_sl2.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl3")
		        	return "templates/tpl_sl3.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl4")
		        	return "templates/tpl_sl4.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl5")
		        	return "templates/tpl_sl5.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl6")
		        	return "templates/tpl_sl6.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl7")
		        	return "templates/tpl_sl7.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl10")
		        	return "templates/tpl_sl10.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl11")
		        	return "templates/tpl_sl11.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl12")
		        	return "templates/tpl_sl12.tpl.html";
	        	if ($scope.groupe.config.tpl == "sl13")
		        	return "templates/tpl_sl13.tpl.html";
	        	if ($scope.groupe.config.tpl == "texte")
			        return "templates/tpl_text.tpl.html";
	        }
	        else if ($scope.groupe.qtype == "L")
	        {
	        	if ($scope.groupe.config.tpl == "radio_demo_genre")
	        		return "templates/tpl_radio_demo_genre.tpl.html";
	        	if ($scope.groupe.config.tpl == "radio")
	        		return "templates/tpl_radio.tpl.html";
	        	if ($scope.groupe.config.tpl == "radio2")
	        		return "templates/tpl_radio2.tpl.html";
	        }
	        else if ($scope.groupe.qtype == "S")
	        {
	        	if ($scope.groupe.config.tpl == "uid")
	        		console.log('save uid');
	        		$scope.nextQuiz();
	        }
	        else
	        {
	        	return "templates/tpl_radio.tpl.html";
	        }
	      }
	    }
	  };
	});

//CORDOVA
angular.module('Cordova', [])
.factory('cordovaReady', function(){
  return function(done) {
    if (typeof window.cordova === 'object') {
      document.addEventListener('deviceready', function () {
    	  console.log('cordovaready');
       // done();
    	  done(null,'cordoveaok');
      }, false);
    } else {
      done();
      done(null,'cordoveako');
    }
  };
});