#! /bin/bash
# see also: https://support.glitch.com/t/language-support-on-glitch-a-list/5466
cd /tmp
curl http://download.redis.io/redis-stable.tar.gz -o redis-stable.tar.gz
tar xf redis-stable.tar.gz
cd redis-stable
nice make PREFIX=/app install
refresh
exit
