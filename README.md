# webject
Share Objects Online with the power of websockets. Keys, Values AND references. Webject is short for Web Object and it really is sharing objects on the web. Someone can host an object, and make authTokens for others online to share this object
# Usage
Using `require` to get `webject.js` is the main idea..
<br>So it may vary from `require('webject')` if installed it as *[An NPMJS Package](https://npmjs.com/package/webject)*
<br>**OR** `require('path/to/webject.js')` if you installed it as the *[Github Package](https://github.com/Y0ursTruly/webject.git)*
<br>*[Example Usage](https://github.com/Y0ursTruly/webject/blob/main/Illustrations/clientAndServer.js)*
<br>For examples of the different aspects of this and different ways to use it, check out *[these examples](https://github.com/Y0ursTruly/webject/tree/main/Illustrations)*
#
You can even use the `connect` function from browser if you load a script tag from [this url](https://cdn.jsdelivr.net/npm/webject@latest/webject.js)(look at the *[comments of webject.js](https://github.com/Y0ursTruly/webject/blob/main/webject.js#L13)* for example)
<br>You can go to a *[LIVE WEB EXAMPLE](https://webject-example.paultaylor2.repl.co/)* (which hosts the equivalent of *[an example](https://github.com/Y0ursTruly/webject/blob/main/Illustrations/httpServerExample.js)*) then paste the following code `connect("wss://webject-example.paultaylor2.repl.co/",authToken).then(obj=>window.mySharedObj=obj)` and `mySharedObj` would be the *shared object*
#
Now there are *TWO* main functions that make up the usage: `serve` and `connect`
<br>*eg*:`let {serve,connect}=require('webject')`
- **serve**: This is a *synchonous* function that would take in two arguments(*obj* and *server*). If a server isn't provided, it will attempt to serve, however the *obj* argument is **NECESSARY** as it will be an object that you will share
<br>*eg*: `let myWebject=serve(myObject)`
<br>However you can *addToken* while passing in a different object to share that different object(each *authToken* can share a different object)
<br>*eg*: `let myToken=myWebject.addToken(1,someDifferentObject)`
- **connect**: This is an *asynchronous* function would take in two arguments(*location* and *authToken*). Both of these are manditory, as you must know where the object is being served **AND** must have a valid *authToken* to access it
<br>*eg*: `let mySharedObject=await connect('wss://example.com:8009',myGivenAuthToken)`

The very first question must be "what *authToken*?". The *authToken* is something(that can be activated from an instance of the `serve` function) that allows other users to `connect` with your object with different levels of permissions.
<br>eg: `myWebject.addToken(1) //returns token of authLevel 1`
- *authLevel 1*: Users who `connect` with this kind of authToken can only *view* the object that they are connecting to
- *authLevel 2*: Users who `connect` with this kind of authToken can *view* and *add*, but they cannot *modify*(as in they can add new keys with data but not edit or delete existing ones)
- *authLevel 3*: Users who `connect` with this kind of authToken can *view*, *add* **AND** *modify* the shared object(lots of power, kinda sus ngl so maybe just make these authTokens **JUST** for yourself if for some reason you wanna go on another process or device and have full control of the object)

However, as for the `serve` function itself, it returns some *utility* tools for managing tokens(for **EACH** call), namely:
- *authTokens*: A list of all tokens existing in that `serve` instance(can be used to kick people(just closing a socket would trigger the cleanup of that socket))
<br>(structure *like* `{..., "webject_dfae":{authToken:"webject_dfae",authLevel:1,clients[someSocket],object:theSharedObj,locked:false}, ...}`)
<br>so to kick a client would be something like `myWebject.authTokens[specificToken].clients[indexOfUnwantedClient].close(1000)`
- *addToken*: The *correct* way to create an *authToken* that takes in a parameter *authLevel* and returns the *authToken* with that level of authorisation
- *endToken*: The *correct* way to remove an *authToken* that takes in a parameter *authToken* to remove it and close **all** connections that were to that token(yes, it kicks everyone who is connected with that token)
- *lock*: This takes in the parameter *authToken* and will prevent further connections to that *authToken* while **NOT** removing clients already connected
- *unlock*: This takes in the parameter *authToken* and enables further connections to that *authToken*(by default when you make a key it's unlocked)
- *addListener*: This takes in 2 parameters(*event* which is a string and *yourReaction* which is a function). *yourReaction* receives an object with several different properties, including the lock and unlock functions(except you can activate them without an *authToken* and it will apply the lock to the event's *token*)
<br>*eg*: `let myHandler=(ev)=>ev.lock();myWebject.addListener("connect",myHandler)` would end up locking each *authToken* upon connection
- *endListener*: This takes in 2 parameters(*event* which is a string and *yourReaction* which is a function). If *yourReaction* exists in the array of *event*, it will be removed from the list
<br>*eg*: `myWebject.removeListener("connect",myHandler)`
# Installation
Three ways
- *[Download Github Package as ZIP](https://github.com/Y0ursTruly/webject/archive/refs/heads/main.zip)*
- `git clone https://github.com/Y0ursTruly/webject.git`
- `npm install webject`
# How it Works
- For the serialisation/deserialisation recursive object cloner that I made for fun a while back I modified to return a "log" which can be translated to an object even with correct referencing
- As for the logic of the sharing, the person who would *`serve`* objects is in control and can *GRANT* different *levels* of access to people who *`connect`* through a system of *authTokens* that the person who did the *`serve`* also has tools to manage
- For sharing this object(the "medium"/method), I create a websocket using the nodejs module `ws`. It will try to use a server(a parameter you give) and if it fails(like if you gave no server parameter), it would then selfhost the socket
- As to the datatypes shared, basically the values of all *keys* in an object(**BESIDES FUNCTIONS**). This is because functions are based on context and I don't have a way *for now*, to replicate a function's context

# Updates
- Nested objects inside the shared object would be **RE-POINTED** to upon changes
<br>See *[this example](https://github.com/Y0ursTruly/webject/blob/main/Illustrations/noRePointing.js)*
<br>Well if you're all the way down here, my email is *[paulrytaylor@gmail.com](mailto:paulrytaylor@gmail.com)*
#
And as for the limitations.. 
- **Unknown**(as in I found a useful purpose for this). It can be used in games where the state of a player is server side and ever changing, sharing an object(authLevel 1 of course in this instance) would make it very easy for the client to work with the server side's data of a player
