var redis = require('redis'),
    client = redis.createClient();

var ns = 'org.jarsonmar.awesomud';

var mobiles = [];

client.smembers(ns + ":movables", function(err, movables) {
    var mlen = movables.length;
    var count = 0;
    for (var i = 0; i < mlen; i++) {
        var mobkey = movables[i];
        //client.hmget(
        //    ns + ":mob:" + mobkey + ":properties",
        //    "name",
        //    "location",
        //    "speed", function(err, props) {
        //    //var mob = {
        //    //    name: props[0],
        //    //    location: props[1],
        //    //    speed: parseInt(props[2]),
        //    //};
        //    //mobiles.push(mob);
        //    count++; // So we know when we're on the last event

        //    if (count === mlen) {
        //        
        //    }
        //});
        
    }
});
