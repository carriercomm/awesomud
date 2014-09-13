var redis = require('redis'),
    client = redis.createClient(),
    async = require('async'),
    _ = require('lodash'),
    randgen = require('randgen'),
    rnorm = randgen.rnorm,
    runif = randgen.runif
    ;

/*
 * NOTE: early POC stages!
 */

var ns = 'org.jarsonmar.awesomud';

var mobiles = [];
var timers = {};

function getMobSpeed(mobkey) {
    var rkey = [ns,'mob',mobkey,'properties'].join(':');
    client.hget(rkey, 'speed', function(err, speed) {
        setTimer(mobkey, parseInt(speed));
    });
}

function randomDirection(directions) {
    var len = directions.length;
    var idx = runif(0, len, true);
    return directions[idx];
}

function moveMobile(mobkey, callback) {
    var from, to, dir;
    var rkey = [ns,'mob',mobkey,'properties'].join(':');
    var getLocation = function(callback) {
        client.hget(rkey, 'location', function(err, location) {
            from = location;
            callback();
        });
    };

    var getDirection = function(callback) {
        var fromExitsKey = [ns,'loc',from,'exits'].join(':');
        client.hkeys(fromExitsKey, function(err, directions) {
            dir = randomDirection(directions);

            // NOTE: This is where door handling is IMPORTANT
            if (directions && directions.length > 0) {
                callback();
            }
            else {
                console.log(from + " has no exits! abandoning movement timer");
                delete timers[mobkey];
            }
        });
    };

    var getDestination = function(callback) {
        client.hget([ns,'loc',from,'exits'].join(':'), dir, function(err, destination) {
            to = destination;
            if (err || !to) {
                console.error(err);
            }
            else {
                callback();
            }
        });
    };

    var updateLocationProperty = function(callback) {
        client.hset(rkey, 'location', to, function(err) {
            if (err) {
                console.error(err);
            }
            else {
                callback();
            }
        });
    };
    
    var updateLocationSets = function(callback) {
        var src = [ns,'loc',from,'mobs'].join(':');
        var dst = [ns,'loc',to,'mobs'].join(':');
        client.smove(src, dst, mobkey, function(err) {
            if (err) {
                console.error(err);
            }
            callback();
        });
    };

    var transferLocation = function(callback) {
        async.parallel(
            [
                updateLocationProperty,
                updateLocationSets,
            ],
            function() {
                callback();
            }
        );
    };

    var actionsInSeries = [
        getLocation,
        getDirection,
        getDestination,
        transferLocation,
    ];

    async.series(actionsInSeries, function() {
        callback(mobkey, dir, from, to);
    });
}

function setTimer(mobkey, speed) {
    if (speed === 0) return;

    var gaussesGuess;
    var meantime = (100 / speed);
    do {
        gaussesGuess = rnorm(meantime, meantime * 0.25);
    } while (gaussesGuess < 0);

    // Set the timer to a defined value so we can
    // check for deletedness later
    timers[mobkey] = true;

    // Set the timer mode
    timers[mobkey] = setTimeout(function() {
        moveMobile(mobkey, function(key, dir, from, to) {
            if (mobkey === 'treadmill:speed') {
                console.log("move " + mobkey + ' [' + dir + '] (' + from + ' -> ' + to + ')');
            }
        });

        // timer key may have been deleted for other reasons
        // whatever reason that may be, just leave it be
        if (timers[mobkey]) {
            timers[mobkey] = setTimer(mobkey, speed);
        }
    }, gaussesGuess * 2000);
}

client.smembers(ns + ":movables", function(err, movables) {
    async.forEach(movables, function(movable, callback) {
        getMobSpeed(movable);
    });
});
