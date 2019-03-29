//Application Window Component Constructor
function ApplicationWindow() {
    // require module network
    var network = require("/ui/services/network");
    var latitudeUser = 0;
    var longitudeUser = 0;
    var latitudeTo = 0;
    var longitudeTo = 0;
    
	//create component instance
	var window = Titanium.UI.createWindow({
		backgroundColor:'#ffffff',
		navBarHidden:true,
		exitOnClose:true,
	});
	
	//create activityIndicator
	var wrapper_indicator = Titanium.UI.createView({
	   backgroundColor : '#333333',
	   opacity : 0,
	   height : Titanium.UI.FILL,
	   width : Titanium.UI.FILL,
	   zIndex : 2
	});
	window.add(wrapper_indicator);
	wrapper_indicator.visible = false;
	
    	var active_indicator  = Titanium.UI.createActivityIndicator({
            style : Titanium.UI.ActivityIndicatorStyle.BIG_DARK,
            top : 0,
            bottom : 0,
            height : Titanium.UI.FILL,
            width : Titanium.UI.FILL,
            zIndex : 3,
        });
        wrapper_indicator.add(active_indicator);
	
	//create wrapperSearch
	var wrapperSearch = Titanium.UI.createView({
	    top : 20,
        left : 15,
        right : 15,
        height : Titanium.UI.SIZE,
        backgroundColor : '#333333',
        zIndex : 2,
        borderRadius : 15,
	});
    window.add(wrapperSearch);

        //create SearchBar
        var searchBar = Titanium.UI.createSearchBar({
            height : 50,
            left : 10,
            right : 10,
            borderRadius : 15,
            showCancel : false,
            color : '#ffffff',
            hintText : 'Busque o local desejado',
            hintTextColor : '#cccccc',
            backgroundColor : '#333333',
        });
        wrapperSearch.add(searchBar);
        searchBar.addEventListener("return",function(e){
            
            active_indicator.show();
            wrapper_indicator.visible = true;
            wrapper_indicator.animate({
                duration : 100,
                opacity : 0.5
            });
           
            var address = e.value;
            
            network.getLatLong({address : address}, function(response){
                active_indicator.hide();
                
                wrapper_indicator.animate({
                   duration : 100,
                   opacity : 0
                }, function () {
                   wrapper_indicator.visible = false;
                });
               
                if(response.results.length > 0){
                    // Remove todos os annotations to da mapView
                    if(annotationTo != undefined){
                        mapView.removeAnnotation([annotationTo]);
                    }
                    
                    latitudeTo = response.results[0].geometry.location.lat;
                    longitudeTo = response.results[0].geometry.location.lng;
                   
                    annotationTo.setSubtitle("Latitude: " + latitudeTo + " | Longitude : " + longitudeTo);
                    annotationTo.setLatitude(latitudeTo);
                    annotationTo.setLongitude(longitudeTo);
                    
                    mapView.addAnnotations([annotationTo, annotationUser]);
                    
                    var yTo = latitudeTo;
                    var xTo = longitudeTo;
                    
                    var yUser = latitudeUser;
                    var xUser = longitudeUser;
                    
                    // distancia_entre_dois_pontos = raiz_quadrada((XB – XA)^2 + (YB -YA)^2)
                    var distance = Math.sqrt(Math.pow(xUser - xTo, 2) + Math.pow(yUser - yTo, 2));
    
                    var newLat = (yTo + yUser) / 2;
                    var newLng = (xTo + xUser) / 2;
                    
                    var deltaY = Math.abs(yTo - yUser) + (0.4 * distance);
                    var deltaX = Math.abs(xTo - xUser) + (0.4 * distance);
    
                    mapView.setRegion({
                        latitude : newLat,
                        longitude : newLng,
                        latitudeDelta: deltaY, 
                        longitudeDelta: deltaX
                    });
                   
                    var params = [
                        {
                            latitudeUser : latitudeUser,
                            longitudeUser : longitudeUser
                        },
                        {
                            latitudeTo : latitudeTo,
                            longitudeTo : longitudeTo
                        },
                        {
                            mode : "driving" //driving - walking
                        }
                    ];
                    var points = [];
                    network.getRoutes(params, function(response){
                        var pointEndLat, pointEndLng, pointStartLat, pointStartLng;
                        
                        if(response.routes.length > 0){
                            for (var i=0; i < response.routes[0].legs[0].steps.length; i++) {
                                pointEndLat = response.routes[0].legs[0].steps[i].end_location.lat;
                                pointEndLng = response.routes[0].legs[0].steps[i].end_location.lng;
                                pointStartLat = response.routes[0].legs[0].steps[i].start_location.lat;
                                pointStartLng = response.routes[0].legs[0].steps[i].start_location.lng;
                                
                                points.push(
                                    {
                                        latitude : pointStartLat,
                                        longitude : pointStartLng
                                    },
                                    {
                                        latitude : pointEndLat,
                                        longitude : pointEndLng
                                    }
                                );
                                
                            };
                            
                            route.setPoints(points);
                            mapView.addRoute(route);
                        }
                        else{
                            var notification = Titanium.UI.createNotification({
                                message:"Desculpe, não foi possível gerar a rota.",
                                duration: Titanium.UI.NOTIFICATION_DURATION_LONG
                            });
                            notification.show();
                        }
                    });
                }
                else{
                    var notification = Titanium.UI.createNotification({
                        message:"Desculpe, não foi possível retornar o resultado.",
                        duration: Titanium.UI.NOTIFICATION_DURATION_LONG
                    });
                    notification.show();
                }
            });
        });
   
    // require module map
    var Map = require('ti.map');
    
    // create polyline
    var routePolyline = Map.createPolyline({
        strokeColor : '#498BF4',
        strokeWidth : 10,
    });
   
    // create route
    var route = Map.createRoute({
       color :  '#498BF4',
       width : 10
    });
    
    // create annotation user
    var annotationUser = Map.createAnnotation({
       pinColor : Map.ANNOTATION_RED,
       title : "Localização do usuário",
       image : "/images/ic_pinuser.png"
    });
    
    // create annotation to
    var annotationTo = Map.createAnnotation({
       pinColor : Map.ANNOTATION_RED,
       title : "Localização desejada",
       image : "/images/ic_pinroute.png"
    });
    
    //create mapview
    var mapView = Map.createView({
        mapType : Map.NORMAL_TYPE, // Deixar o mapa normal
        animate : true, // Criar animação ao localizar o usuário
    });
    window.add(mapView);

    //Quando o mapa terminar de ser renderizado, eu peço a localização para o usuário
    mapView.addEventListener('complete', function(){         
        //Chamar um método, passando o tipo de autorização junto com uma função de callback que será executada dependendo da resposta do usuário
        requestGetUserLocation(Titanium.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e){
            
            // Se não tiver sucesso (Usuário negar permissão)
            if(!e.success){
                //Cria uma caixa de dialogo
                var dialog = Titanium.UI.createAlertDialog({
                   title : "Mensagem Importante",
                   message : "É necessário obter sua localização para que o aplicativo possa funcionar corretamente",
                   ok : "Ir até Configurações"
                });
                
                //Quando ele clicar na caixa de dialogo
                dialog.addEventListener("click", function(){
                    
                    //Criando uma intenção
                    var intent = Titanium.Android.createIntent({
                        action : "android.settings.APPLICATION_SETTINGS" //Definindo o local da ação
                    });
                    
                    //Adicionando Flags
                    intent.addFlags(Titanium.Android.FLAG_ACTIVITY_NEW_TASK);
                    
                    Titanium.Android.currentActivity.startActivity(intent); //Startando a intenção
                });
            
                // Mostra caixa de dialogo
                dialog.show();
            }
            else{
                Titanium.Geolocation.getCurrentPosition(function(e){
                    longitudeUser = e.coords.longitude;
                    latitudeUser = e.coords.latitude;
                    
                    network.getAdress([{latitude : latitudeUser}, {longitude : longitudeUser}], function(response){
                        var address = response.results[0].formatted_address;
                        annotationUser.setSubtitle(address);
                    });
                    
                    annotationUser.setLatitude(latitudeUser);
                    annotationUser.setLongitude(longitudeUser);
                    
                    mapView.setRegion({
                        latitude : latitudeUser,
                        longitude : longitudeUser,
                        latitudeDelta: 0.010, 
                        longitudeDelta: 0.018
                    });
                    
                    mapView.setAnnotations([annotationUser]);
                });
            }
        });
    });

	return window;
} 

function requestGetUserLocation(authorizationType, callback){
    
    //Verificando se já possui autorização
    if(Titanium.Geolocation.hasLocationPermissions(authorizationType)){
        return callback({
            success : true
        });
    }
    
    // Fazendo requisição de Permissão
    Titanium.Geolocation.requestLocationPermissions(authorizationType, function(e){
        // Se o usuário permitir
        if(e.success){
            return callback({
                success : true
            });
        }
        else{
            return callback({
                success : false
            });
        }
    });
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
