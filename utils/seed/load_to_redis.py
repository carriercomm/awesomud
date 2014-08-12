import redis
import json
from types import ListType, DictionaryType


def populate(r):
    f = open("utils/zones.json")
    data = json.load(f)
    f.close()

    for key in data:
        if (type(data[key]) is ListType):
            for setitem in data[key]:
                r.sadd(key, setitem)
        elif (type(data[key]) is DictionaryType):
            for hkey, hvalue in data[key].iteritems():
                r.hset(key, hkey, hvalue)
        elif data[key] is not None:
            r.set(key, data[key])

if __name__ == '__main__':
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    populate(r)
