# webject
Share Objects Online with the power of websockets. Keys, Values AND references. Webject is short for Web Object and it really is a system for sharing objects on the web. Someone can host an object, and make authTokens for others online to share this object
<br>
- **Please note**: Please ensure that the same version of *webject* is used across the different points/ends of your application that use it
# Installation
Three ways
- *[Download Github Package as ZIP](https://github.com/Y0ursTruly/webject/archive/refs/heads/main.zip)*
- `git clone https://github.com/Y0ursTruly/webject.git`
- `npm install webject`
# How it Works
- For the serialisation/deserialisation recursive object cloner that I made for fun a while back I modified to return a "log" which can be translated to an object even with correct referencing
- As for the logic of the sharing, the person who would *`serve`* objects is in control and can *GRANT* different *levels* of access to people who *`connect`* through a system of *authTokens* that the person who did the *`serve`* also has tools to manage
- For sharing this object(the "medium"/method), I create a websocket using the nodejs module `ws`. It will try to use a server(a parameter you give) and if it fails(like if you gave no server parameter), it would then selfhost the socket
- As to the datatypes shared, everything that [JSON](https://www.geeksforgeeks.org/json-data-types/) deals with AND `undefined` values AND [circular objects](https://www.akinjide.me/2018/circular-reference-in-javascript/)
<br>~~Support for more data types coming soon~~
- For the various parts of this system, do check out *[ILLUSTATIONS](https://github.com/Y0ursTruly/webject/tree/main/Illustrations)* for examples :D

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
**DO NOTE**: This applies for all functions I have, that if you enter falsish values(like `null,0,"",false,undefined`), the default actions would be taken as if you never input anything into that argument(eg: `serve(myObject,null)` would have the same effect of `serve(myObject)`)
<br>Now there are *TWO* main functions that make up the usage: `serve` and `connect` but *SIX* in total, the other 4 being `sync`, `desync`, `objToString`, `stringToObj`
<br>*eg*:`let {serve,connect}=require('webject')`
# Modules
- **serve**: This is a *synchonous* function that would take in two arguments(*obj* and *server*). If a server isn't provided, it will attempt to serve, however the *obj* argument is **NECESSARY** as it will be an object that you will share
<br>*eg*: `let myWebject=serve(myObject)`
<br>However, the *addToken* function is **required** to make a way for a client to share your object through a token you would give them
<br>Moreover you can *addToken* while passing in a different object to share that different object(each *authToken* can share a different object)
<br>*eg*:
```js
let myToken=myWebject.addToken(1,someDifferentObject) //leaving out second parameter would addToken for myObject by default
```
<br>Additionally, you can set a *manual token* with the *addToken* function using the third parameter called *specificToken* (because by default the token is a randomly generated string)
<br>*eg*:
```js
let myToken=myWebject.addToken(1,null,"my_key")
//null/no value/undefined would mean sharing the original object from the serve function and "my_key" would be the value returned IF that is a unique token
```
- **connect**: This is an *asynchronous* function would take in two manditory arguments(*location* and *authToken*) and two optional arguments(*onFail* and *object*). For the manditory ones, as you must know where the object is being served **AND** must have a valid *authToken* to access it.
<br>For the first optional argument, *onFail*, it must be a function and it is called whenever the connection is closed/broken
<br>For the second optional argument, *object*, it is the object that *you* want the remote object to be(usually the function returns a *new* object for you)
<br>example usage of the optional arguments can be seen in *[onFailTesting.js](https://github.com/Y0ursTruly/webject/edit/main/Illustrations/onFailTesting.js)*
<br>*eg*:
```js
let mySharedObject=await connect('wss://example.com:8009',myGivenAuthToken)
//port 8009 is the default port from this when the websocket is created(and the serve function isn't given a server parameter)
```
- **sync**: This is a *synchronous* function with three arguments(*obj*, *filePath*, *spacing*). If the third argument is not provided, file saving from the object would be done without extra spacing(one chunked line). This function returns an interval ID for the interval it sets to write to specified *filePath* when the object changes
- **desync**: This is a *synchronous* function that takes in one arguments(*syncID*). It clears the interval of ID *syncID* quite literally, however it does throw an error if it is an invalid *syncID*
- **objToString**: This function is forwarded from *[serial.js](https://github.com/Y0ursTruly/webject/blob/main/serial.js)* and takes in an object and returns a stringified version of the object
<br>This is a *synchronous* function that takes in four arguments(*obj*, *cmpStr*, *spacing*, *checkClone*)
<br>If the second parameter is used, it will return only the difference from a previous *objToString* of the object(implemented to send only the changes of the object)
<br>The last 2 are optional, since one might only care about spacing for visual appeal, and when my system calls this function, it never uses the checkClone option, however you might want to use it for fun ;D
- **stringToObj**: This function is forwarded from *[serial.js](https://github.com/Y0ursTruly/webject/blob/main/serial.js)* and takes in either a string and returns the object parsed from that string
<br>This is a *synchronous* function that takes in two arguments(*string*, *obj*). If the second parameter isn't used, it ONLY returns the object parsed from the string. However, if the second parameter is used(*obj*), it modifies *obj* into the parsed object from the string while still pointing to the nested objects that are still objects according to the string's information. See *[noRepointing.js](https://github.com/Y0ursTruly/webject/blob/main/Illustrations/noRePointing.js)* as a code demonstration. As for the third parameter, it's a boolean and if true, it will assume that it is only receiving the *difference* and not the *entire* object

# The AuthToken
The *authToken* is something(that can be activated from an instance of the `serve` function) that allows other users to `connect` with your object with different levels of permissions.
<br>eg:
```js
myWebject.addToken(1) //returns token of authLevel 1
//authLevels in general decide the amount of control the client has of your object(the one you share)
```
- *authLevel 1*: Users who `connect` with this kind of authToken can only *view* the object that they are connecting to
- *authLevel 2*: Users who `connect` with this kind of authToken can *view* and *add*, but they cannot *modify*(as in they can add new keys with data but not edit or delete existing ones)
- *authLevel 3*: Users who `connect` with this kind of authToken can *view*, *add* **AND** *modify* the shared object(lots of power, kinda sus ngl so maybe just make these authTokens **JUST** for yourself if for some reason you wanna go on another process or device and have full control of the object)

However, as for the `serve` function itself, it returns some *utility* tools for managing tokens(for **EACH** call), namely:
- *authTokens*: A list of all tokens existing in that `serve` instance(can be used to kick people(just closing a socket would trigger the cleanup of that socket))
<br>*example structure*

```js
{
  ...,
  "webject_dfae":{ //one authToken object
    authToken:"webject_dfae",
    authLevel:1,
    clients:Map[someSocket1=>1,someSocket2=>1],
    object:theSharedObj,
    locked:false,
    string:objToString(theSharedObj)
  },
  ...,
}
```

# Methods
~~`serve` is the only module that returns an object with methods~~<br>
- **addToken**: The *correct* way to create an *authToken* that takes in a parameter *authLevel* or an optional second parameter *object* and returns the *authToken* with that level of authorisation, then finally a third optional paremeter of *specificToken*. If you do use the second parameter, an *that* object would be shared since you can share a different object per token :D
<br>Needless to say, if you don't use the second parameter, it will default to the object chosen when the *serve* function was called
<br>The third optional parameter is for setting an *authToken* **manually**, which adds further flexibility to this function
- **endToken**: The *correct* way to remove an *authToken* that takes in a parameter *authToken* to remove it and close **all** connections that were to that token(yes, it kicks everyone who is connected with that token)
- **lock**: This takes in the parameter *authToken* and will prevent further connections to that *authToken* while **NOT** removing clients already connected
- **unlock**: This takes in the parameter *authToken* and enables further connections to that *authToken*(by default when you make a key it's unlocked)
- **addListener**: This takes in 2 parameters(*event* which is a string and *yourReaction* which is a function). *yourReaction* receives an object with several different properties, including the lock and unlock functions(except you can activate them without an *authToken* and it will apply the lock to the event's *token*)
<br>*object given to `yourReaction` function when used in `addListener` upon an event dispatch*

```js
{
  token, //an authToken object
  socket, //a websocket object
  type, //event name(eg: "edit")
  lock, //function to lock a specified token or the event's authToken
  unlock, //function to unlock a specified token or the event's authToken
  preventDefault //function to stop event propogation(no other listeners get called after one listener activtes this)
}
```
<br>*eg*: `let myHandler=(ev)=>ev.lock(); myWebject.addListener("connect",myHandler)` would end up locking each *authToken* upon connection
<br>There are a total of *THREE* valid values for *event* right now, namely *connect*, *disconnect* and *edit*. See *[eventsTesting.js](https://github.com/Y0ursTruly/webject/blob/main/Illustrations/eventsTesting.js)* and *[lockTesting.js](https://github.com/Y0ursTruly/webject/blob/main/Illustrations/lockTesting.js)* for examples
- *endListener*: This takes in 2 parameters(*event* which is a string and *yourReaction* which is a function). If *yourReaction* exists in the array of *event*, it will be removed from the list
<br>*eg*: `myWebject.removeListener("connect",myHandler)`

# Updates
- **heartbeat/ping logic**: Basically, I had a repl server and sometimes I turned off my connection(from my pc) and the server still behaved as if the connection was live.. so I've implemented this logic
- **new `object` parameter in `connect`**: This allows the user to connect to the remote object BUT with the user's object

<br>Well if you're all the way down here, my email is *[paulrytaylor@gmail.com](mailto:paulrytaylor@gmail.com)*
