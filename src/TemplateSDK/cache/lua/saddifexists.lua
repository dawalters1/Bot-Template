local key = KEYS[1]
local values = ARGV;
local batch = 7500

if(redis.call('EXISTS', key) == 1) then -- If key exists, batch add data
    for i = 1, #values, batch do
        redis.call('SADD', key, unpack(values, i, math.min(i + batch - 1, #values)))
    end
end;