# Installation

Run a redis server locally.

```
python utils/seed/load_to_redis.py
npm install
```

# Running (with daemontools)

To start the scheduler service:

```
supervise utils/service/scheduler

```

To restart all the services:
```
./utils/service/reset.sh
```
