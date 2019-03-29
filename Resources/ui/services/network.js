var GOOGLE_API_KEY = "";

module.exports.getAdress = function(params, callback){
    //Variável de conexão
    var connect = Titanium.Network.createHTTPClient();  
    
    //Definindo tempo de conexão
    connect.setTimeout(10000);
    
    //Quando carregar
    connect.onload = function(){
        var response = JSON.parse(this.responseText); // Recebendo JSON
        callback(response); //Passando o response na função de callback
    };
    
    //Caso dê erro na conexão
    connect.onerror = function(){
       Titanium.API.error("Ocorreu erro na conexão!"); 
    };
    
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + params[0].latitude + "," + params[1].longitude + "&sensor=true&types=sublocality_level_1&key=" + GOOGLE_API_KEY;
    //console.log(url);
    connect.open("GET", url);
    connect.send();
};

module.exports.getLatLong = function(params, callback){
    
    //Variável de conexão
    var connect = Titanium.Network.createHTTPClient();
    
    //Definindo tempo de conexão
    connect.setTimeout(10000);
    
    //Quando carregar
    connect.onload = function(){
        var response = JSON.parse(this.responseText); // Recebendo JSON
        callback(response); //Passando o response na função de callback
    };
    
    //Caso dê erro na conexão
    connect.onerror = function(){
       Titanium.API.error("Ocorreu erro na conexão!"); 
    };
    
    connect.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?key=" + GOOGLE_API_KEY + "&sensor=true&types=sublocality_level_1&address=" + params.address);
    connect.send();
};

module.exports.getRoutes = function(params, callback){
    // Variável de conexão
    var connect = Titanium.Network.createHTTPClient();
    
    //Definindo tempo de conexão
    connect.setTimeout(10000);
    
    //Quando carregar
    connect.onload = function(){
        var response = JSON.parse(this.responseText);
        callback(response);  
    };
    
    //Caso dê erro na conexão
    connect.onerror = function(){
       Titanium.API.error("Ocorreu erro na conexão!"); 
    };
    
    connect.open("GET", "https://maps.googleapis.com/maps/api/directions/json?origin=" + params[0].latitudeUser + "," + params[0].longitudeUser + "&destination=" + params[1].latitudeTo + "," + params[1].longitudeTo + "&mode=" + params[2].mode + "&key=" + GOOGLE_API_KEY);
    connect.send();
};

