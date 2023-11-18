local key = KEYS[1]

local keyExists = redis.call('EXISTS', key); -- Check to see if the key exists

if(keyExists == 0) then
    return nil -- Key does not exist return null
end;

return redis.call('SMEMBERS', key); -- Key exists return list
