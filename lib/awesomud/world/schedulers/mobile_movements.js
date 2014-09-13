var async = require('async'),
    randgen = require('randgen'),
    rnorm = randgen.rnorm,
    runif = randgen.runif,
    _ = require('lodash')
    ;

/*
 * NOTE: early POC stages!
 */

var ns = 'org.jarsonmar.awesomud';

var mobiles = [];
var timers = {};

function getMobSpeed(client, mobkey) {
    var rkey = [ns,'mob',mobkey,'properties'].join(':');
    client.hget(rkey, 'speed', function(err, speed) {
        setTimer(client, mobkey, parseInt(speed));
    });
}

function randomDirection(directions) {
    var len = directions.length;
    var idx = runif(0, len, true);
    return directions[idx];
}

function moveMobile(client, mobkey, callback) {
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
                console.log(from + " has no exits! abandoning movement timer for " + mobkey);
                if (timers[mobkey]) {
                    clearTimeout(timers[mobkey]);
                    delete timers[mobkey];
                }
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

var completionCB;

function setTimer(client, mobkey, speed, again) {
    if (speed === 0) return;


    var gaussesGuess;
    var meantime = (100 / speed);
    do {
        gaussesGuess = rnorm(meantime, meantime * 0.25);
    } while (gaussesGuess < 0);

    if (again && !timers[mobkey]) {
        // Timer was deleted
        return;
    }
    // Set the timer mode
    timers[mobkey] = setTimeout(function() {
        moveMobile(client, mobkey, function(key, dir, from, to) {
            if (_.isFunction(completionCB)) {
                completionCB(mobkey, dir, from, to);
            }
            if (timers[mobkey]) {
                setTimer(client, mobkey, speed, true);
            }
        });

    }, gaussesGuess * 2000);
}

exports.setMoveCallback = function(cb) {
    completionCB = cb;
}

exports.schedule = function(client) {
    client.smembers(ns + ":movables", function(err, movables) {
        async.forEach(movables, function(movable, callback) {
            //if (movable !== 'treadmill:speed') return;
            getMobSpeed(client, movable);
        });
    });
};
