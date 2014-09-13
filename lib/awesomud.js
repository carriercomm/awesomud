var redis = require('redis'),
    client = redis.createClient(),
    mobile_movements = require('./awesomud/world/schedulers/mobile_movements');

mobile_movements.schedule(client);
