var redis = require('redis'),
    client = redis.createClient(),
    events = require('events'),
    async = require('async'),
    _ = require('lodash'),
    rnorm = require('randgen').rnorm;

var ns = 'org.jarsonmar.awesomud';

var mobiles = [];
var timers = {};

var seenMove = {};
var eventEmitter = new events.EventEmitter();

function getMobSpeed(mobkey) {
    var rkey = [ns,'mob',mobkey,'properties'].join(':');
    client.hget(rkey, 'speed', function(err, speed) {
        setTimer(mobkey, parseInt(speed));
    });
}

function setTimer(mobkey, speed) {
    if (speed === 0) return;

    var gaussesGuess;
    var meantime = (100 / speed);
    do {
        gaussesGuess = rnorm(meantime, meantime * 0.25);
    } while (gaussesGuess < 0);

    timers[mobkey] = setTimeout(function() {
        if (!seenMove[mobkey]) {
            seenMove[mobkey] = true;
            console.log(_.keys(seenMove).length);
        }
        console.log("move " + mobkey + ' (' + gaussesGuess + ')');
        timers[mobkey] = setTimer(mobkey, speed);
    }, gaussesGuess * 2000);
}

client.smembers(ns + ":movables", function(err, movables) {
    async.forEach(movables, function(movable, callback) {
        getMobSpeed(movable);
    });
});
