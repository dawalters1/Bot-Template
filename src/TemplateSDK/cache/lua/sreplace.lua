local key = KEYS[1];
local values = ARGV;
local batch = 7500

redis.call('DEL', key); -- Delete the original key before adding the new data

for i = 1, #values, batch do -- Batch add the new data
    redis.call('SADD', key, unpack(values, i, math.min(i + batch - 1, #values)))
end