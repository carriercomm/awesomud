var redis = require('redis'),
    client = redis.createClient(),
    mobile_movements = require('./awesomud/world/schedulers/mobile_movements'),
    npid = require('npid');

npid.create('.pid/scheduler.pid', true);
console.log("STARTING SCHEDULER]");
mobile_movements.setMoveCallback(function(mobkey, dir, from, to) {
    var msg = "move " + mobkey + ' [' + dir + '] (' + from + ' -> ' + to + ')'
    console.log(msg);
});
mobile_movements.schedule(client);


