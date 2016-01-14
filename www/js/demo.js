// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('MobileAngularUiExamples', [
  'Cordova',                                                   
  'ngRoute',
  'ngSanitize',
  //'ngAnimate',
  'mobile-angular-ui',
  
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures',
  'monospaced.elastic',
  //'ui.bootstrap',
  'luegg.directives',
  'starter.services',
  
  
]);


// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'templates/home.html', reloadOnSearch: false});
  $routeProvider.when('/useok',      	{templateUrl: 'templates/useok.html', reloadOnSearch: false});
  $routeProvider.when('/profileok',     {templateUrl: 'templates/profileok.html', reloadOnSearch: false});
  $routeProvider.when('/quizProfile',   {templateUrl: 'templates/quizprofile.html', reloadOnSearch: false});
  $routeProvider.when('/quiz',     		{templateUrl: 'templates/quiz.html', reloadOnSearch: false});
  $routeProvider.when('/results',     	{templateUrl: 'templates/results.html', reloadOnSearch: false});
  $routeProvider.when('/journal',     	{templateUrl: 'templates/journal.html', reloadOnSearch: false});
  $routeProvider.when('/notif',     	{templateUrl: 'templates/notif.html', reloadOnSearch: false});
  $routeProvider.when('/sendResults',   {templateUrl: 'templates/sendresults.html', reloadOnSearch: false});
  $routeProvider.when('/apropos',    	{templateUrl: 'templates/apropos.html', reloadOnSearch: false});
});

app.controller('MainController', function(cordovaReady,$rootScope, $scope,$location,$route,$sanitize,$sce, $interval){
	
	
	
	$scope.test ="test";
	$scope.larg = "0";
	$scope.haut = "0";
	$scope.body = "0";
	$scope.cas = "0";
	$scope.menu = false;
	if ($scope.quiz === undefined)
		$scope.quiz ={};
	$scope.quiz.currentSID = "none";
	$scope.quiz.currentHoraire = "init";
	$scope.quizQuoti = quiz_quotidien;
	$scope.quizHebdo = quiz_hebdo;
	$scope.notif=true;
	$scope.noconnexion = false;
	$scope.notes = [];
	//$scope.mynote = "test";
	
	//remise à false tout les 1h...
	$interval(function(){ $scope.noconnexion = false;}, 3600000);
	
	/*$interval(function () {
	    console.log("Interval occurred");
	}, 5000);*/
	//Séquence d'initialisation
	async.series([	
	              	function(callback){ cordovaReady(callback);},
	              	function(callback){init_DB(callback);},
	               		
	              	//create tables
	              	function(callback){createTableQuestionnaires(callback);},
	              	function(callback){createTableHoraires(callback);},
	              	function(callback){createTableReponses(callback);},
	              	function(callback){createTableNotes(callback);},
	              	
		               	
	              	//create db content
	              	function(callback){createQuestionnairesSuccess(callback);},
	              	function(callback){getQuestionList($scope,quiz_quotidien,callback);},
	              	function(callback){getQuestionList($scope,quiz_hebdo,callback);},
	              	
	              	//create deviceID
	              	function(callback){createDeviceID(callback,$scope);},
	              	
	              	//horaires
	              	function(callback){checkNotif(callback,$scope);},
	              	function(callback){createHorairesSuccess(callback,$interval,$scope);},

	              	
	              	//test useOk
	              	function(callback){do_MC_UseOk(callback,$location,$route,$scope);},
	        ],	   				 
			function(err, results ){
					//getQuestionList($scope,quiz_quotidien);
					//console.log(results);
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
			sendReponses($scope);
			$scope.menu = true;
			$route.reload();
		}

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
        			body:     'Votre idendifiant : '+$scope.quiz.deviceID //=> res/drawable/icon (Android)
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
		sendReponses($scope);
		$scope.menu = true;
		$route.reload();
	}
	
	$scope.openResult = function(){
		currentDate = new Date();
		window.open("https://restitution.altotoc.fr/?sid="+quiz_quotidien+","+quiz_hebdo+"&curs="+currentDate.getFullYear()+"-"+('0' + (parseInt(currentDate.getMonth())+1)).slice(-2)+"-"+('0' + currentDate.getDate()).slice(-2)+"&period=m&uid="+$scope.quiz.deviceID, '_blank', 'location=no,closebuttoncaption=Fermer');
	}//FIN FONCTION openResult
	
	/////////////
	//FONCTION getQuestionList
	$scope.getQuestionList = function(){
		console.log('getQuestionList');
		getQuestionList($scope,quiz_quotidien);
		return $scope.questionslist;
		//return true;
		
	}//FIN FONCTION getQuestionList
	
	
	$scope.disabledSendMail = function(){
		//$scope.selectedOptions=true;
		var invalid = true;
		$( "#sendResultsMail input:checked").each(function( index ) {
			invalid = false
			});
		//console.log('valid');
		//console.log($scope.questionslist);
		return invalid;
		
		//return true;
		
	}//FIN FONCTION change
	
	/////////////
	//BUTTON ENVOYER MAIL
	$scope.sendMail= function(clickEvent){
		console.log('sendmail');
		var myquestionList = "";
		var myPeriod = "";
		$( "#sendResultsMail input[type=checkbox]:checked").each(function( index ) {
			  //console.log( index + ": " + $( this ).attr('id') );
			  myquestionList += $( this ).attr('value') +",";
			});
		if (myquestionList != "")
			myquestionList = myquestionList.substring(0,myquestionList.length-1);
		
		myPeriod = $( "#sendResultsMail input[type=radio]:checked").attr('value');
		
		mydate = $( "#sendResultsMail input[type=date]").val();

		//console.log("myquestionList");
		//console.log(myquestionList);
		if(isMobile)
		{
			
			
		var fileTransfer = new FileTransfer();
		var fileURL = cordova.file.dataDirectory+"montest.pdf";
		//test android seulement :
		var fileURL = "cdvfile://localhost/persistent/"+"mesdonnees.pdf"; 
		//var uri = "http://restitution.altotoc.fr/pdf?curs=2015-01-01&sid=236551&qid="+questionList; //modif php pour repondre qqchose par defaut si pas de param
		//var uri = "http://restitution.altotoc.fr/pdf?sid=916553&curs=2015-01-01"; //modif php pour repondre qqchose par defaut si pas de param
		//currentDate = new Date();
		var uri = "https://restitution.altotoc.fr/pdf?sid="+quiz_quotidien+","+quiz_hebdo+"&curs="+mydate+"&period="+myPeriod+"&uid="+$scope.quiz.deviceID+"&qid="+myquestionList;	
		if (window.device.platform=="Android") {
			var uri = "http://restitution.altotoc.fr/pdf?sid="+quiz_quotidien+","+quiz_hebdo+"&curs="+mydate+"&period="+myPeriod+"&uid="+$scope.quiz.deviceID+"&qid="+myquestionList;
			var fileURL = cordova.file.dataDirectory+"montest2.pdf";
		}
		
		fileTransfer.download(
			    uri,
			    fileURL,
			    function(entry) {
			        console.log("download complete: " + entry.toURL());
			        console.log("download complete: " + entry.toNativeURL());
			        
			        //envoi mail
			       alert("download complete: " + entry.toURL());
			       alert("download complete: " + entry.toNativeURL());
			        cordova.plugins.email.isAvailable(function(result){ 
			        	if (result) //mail dispo
			        	{
			        		cordova.plugins.email.open({
			        			subject: 'rapport données',
			        		    attachments: entry.toURL() //=> res/drawable/icon (Android)
			        		});
			        	}
			        	else
			        	{
			        		navigator.notification.alert(
			        				'Veuillez renseigner un compte dans Mail pour pouvoir envoyer vos résultats',  // message
			        			    function(){},         // callback
			        			    'Erreur',            // title
			        			    'Ok'                  // buttonName
			        			);
			        	}
			        });
			    },
			    function(error) {
			    	alert("download error source " + error.source);
			    	alert("download error target " + error.target);
			    	alert("upload error code" + error.code);
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
		sendReponses($scope);
		$scope.menu = true;
		$route.reload();*/
	}//FIN BUTTON ENVOYER MAIL
	
	$scope.notifMe = function(notifMeModel){
		console.log('notifMe');
		if (notifMeModel)
			setNotif($scope);
		else
			deleteNotif($scope);
		console.log(notifMeModel);
	}//FIN fonction notifMe
	
	//NOTES///////////////////
	//Enregistrer note
	$scope.saveMyNote = function(clickEvent){
		//$scope.mynote = ""
		saveNote($scope);
	}
	
	$scope.tsToDate = function(ts){
		//$scope.mynote = ""
		return convertTsToDate(ts);
	}
	
	$scope.textToDisplayText = function(text){
		//$scope.mynote = ""
		return convertTextToDisplayText(text);
	}
	
	
	
	$scope.sendMyNotes = function(clickEvent){
		console.log("sendMyNotes");
		//$scope.mynote = ""
		//saveNote($scope);
		if(isMobile)
		{
			cordova.plugins.email.isAvailable(function(result){ 
	        	if (result) //mail dispo
	        	{
	        		cordova.plugins.email.open({
	        			subject: "[Smart'TOC] Mes notes",
	        			body:      getNotesHTML($scope), // email body (for HTML, set isHtml to true)
	        		    isHtml:    true, // indicats if the body is HTML or plain text
	        		});
	        	}
	        	else
	        	{
	        		navigator.notification.alert(
	        				'Veuillez renseigner un compte dans Mail pour pouvoir envoyer vos résultats',  // message
	        			    function(){},         // callback
	        			    'Erreur',            // title
	        			    'Ok'                  // buttonName
	        			);
	        	}
	        });
		}
		else
			 getNotesHTML($scope);
	}
	
	/**************=*/
	
	$scope.today = function() {
	    $scope.dt = new Date();
	    $scope.dtinit =  $scope.dt.getFullYear()+"-"+('0' + (parseInt($scope.dt.getMonth())+1)).slice(-2)+"-"+('0' + $scope.dt.getDate()).slice(-2);
	  };
	  $scope.today();

	
}); // fin MainController

//form scroll
app.directive('noteList', function ($window) {

    return {
        restrict: 'C',

        link: function (scope, elem, attrs) {

            var winHeight = $window.innerHeight;

            var headerHeight = attrs.banner ? attrs.banner : 0;
            
            var elemHeight = $(window).height() - $('.titre_journal').outerHeight() - $('.noteForm').outerHeight() - $('.navbar').outerHeight() ;

            elem.css('height', elemHeight + 'px');
            console.log('ttt');
        }
    };
});

app.directive('myNotes', function ($window) {

    return {
        restrict: 'C',
        //scope: false,
       // require: '^ngController', // controller parent


        link: function ($scope, elem, attrs) {
        	console.log('mynotes');
        	getNotes($scope);

           /* var winHeight = $window.innerHeight;

            var headerHeight = attrs.banner ? attrs.banner : 0;
            
            var elemHeight = $(window).height() - $('.titre_journal').outerHeight() - $('.noteForm').outerHeight() - $('.navbar').outerHeight() ;

            elem.css('height', elemHeight + 'px');
            console.log('ttt');*/
        }
    };
});

app.directive( 'noteFormHeightChange', function($window) {
    return {
    	 restrict: 'C',
        link: function( scope, elem, attrs ) {
        	 console.log('rrr');
           /* scope.$watch( '__height', function( newHeight, oldHeight ) {
                elem.attr( 'style', 'margin-top: ' + (58 + newHeight) + 'px' );
            } );*/
        	 scope.$watch
        	 (
        			 
        	  function () {console.log(elem);
        	   return {
        	    //w:linkElement.width(),
        	    //h:elem.height()
        	    h:elem[0].offsetHeight
        	   };
        	  },
        	  function (newValue, oldValue) {
        	  // if (newValue.w != oldValue.w || newValue.h != oldValue.h) {
        		  if (newValue.h != oldValue.h) {
        	    // Do something ...
        	    console.log(newValue);
        	    var winHeight = $window.innerHeight;      
                var scrollHeight = $(window).height() - $('.titre_journal').outerHeight() - $('.noteForm').outerHeight() - $('.navbar').outerHeight() ;

                $('.noteList').css('height', scrollHeight + 'px');
        	   /* scope.$apply(function(){
                    //do something to update current scope based on the new innerWidth and let angular update the view.
                 });*/
        	   }
        	  },
        	  true
        	 );
        }
    }
} );

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
	        	if ($scope.groupe.config.tpl == "radio2")
	        		return "templates/tpl_radio2.tpl.html";
	        	if ($scope.groupe.config.tpl == "radio")
	        		return "templates/tpl_radio.tpl.html";
	        	
	        }
	        else if ($scope.groupe.qtype == "S")
	        {
	        	if ($scope.groupe.config.tpl == "uid")
	        		console.log('save uid');
	        		$scope.nextQuiz();
	        }
	        else if ($scope.groupe.qtype == "!")
	        {
	        	if ($scope.groupe.config.tpl == "radio2")
	        		return "templates/tpl_radio2.tpl.html";
	        	if ($scope.groupe.config.tpl == "radio")
	        		return "templates/tpl_radio.tpl.html";
	        	if ($scope.groupe.config.tpl == "radio3")
	        		return "templates/tpl_radio3.tpl.html";
	        	if ($scope.groupe.config.tpl == "radio_demo_genre")
	        		return "templates/tpl_radio_demo_genre.tpl.html";
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
    	  if (isMobile)
    	  {
    		 // Keyboard.shrinkView(false);
    		  Keyboard.hideFormAccessoryBar(true);
    	  }
    		  
       // done();
    	  done(null,'cordoveaok');
      }, false);
    } else {
      done();
      done(null,'cordoveako');
    }
  };
});