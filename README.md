# hey, look at us

This site tell you how many people are on it right now. That's it.

# How does it work?

Visitors are identified by a server-generated UUID stored in browser local storage. The browser polls the server, continuing to notify the server that the visitor is still here. Each poll request refreshes the TTL on a redis key named for the visitor's UUID. The server reports back how many visitors' redis keys currently exist. The redis keys expire within seconds, so this count gives us a fairly accurate estimate of the current number of visitors.
