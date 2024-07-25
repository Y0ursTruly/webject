# Webject
Share (and sync) Objects Online with the power of websockets. Keys, Values AND References. Webject is short for Web Object and it really is a system for sharing objects on the web. Someone can host an object, then create and configure an authToken, enabling clients to connect to the object with the permissions/constraints defined by the respective authToken it a client connects with. Why Webject? This tool has usage for whenever one wishes to either collaborate on or simply share/sync real time data remotely with ease >:D
<br>
**Please note**:
- To view example usage of the modules this library provides, please refer to the _[tests](https://github.com/Y0ursTruly/webject/blob/main/tests.js)_
- TypeScript Definitions Added >:D

# Installation
Multiple ways
- *[Download Github Package as ZIP](https://github.com/Y0ursTruly/webject/archive/refs/heads/main.zip)*
- _[git cli](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)_: `git clone https://github.com/Y0ursTruly/webject.git`
- _[npm cli](https://docs.npmjs.com/cli)_: `npm install webject`
- browser/frontend script tag: `<script src="https://cdn.jsdelivr.net/npm/webject@latest/for_browser.min.js"></script>`

# Importing
```
const {
  serve, //doesn't exist on browser
  connect, //is a global variable when browser script is loaded
  sync, //doesn't exist on browser
  desync, //doesn't exist on browser
  objToString, //is a global variable when browser script is loaded
  stringToObj, //is a global variable when browser script is loaded
  objValueFrom, //is a global variable when browser script is loaded
  setConsistency //doesn't exist on browser
} = require("webject");
```

# ADVISORY
If you (the developer) wish to use this as a database (achieve persistence using the `sync` module), in [ACID](https://www.techtarget.com/searchdatamanagement/definition/ACID), this library only enforces **D** without any work and **A,C,D** when utilising a given `setConsistency` module which should be used to declare if an object is safe for saving or not (if a transaction is complete or not). **Isolation** must be handled by you, the developer, since this library is designed to allow objects to be _shared/synced_ among multiple clients concurrently.

# Modules
<ul>
  <li>
    <details>
      <summary><code>serve([object[,server]])</code></summary>
      <ul>
        <li><b>Description: </b>Creates a websocket and returns methods for configuring <a href="#token">authToken</a>s to share objects</li>
        <li><b>Returns: </b>
        <details>
          <summary><u><code>myWebject Instance</code></u></summary>
          <ul>
            <li><code>authTokens</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map">Map</a></li>
            <li>
              <details>
                <summary><code>addListener(event,yourReaction)</code></summary>
                <ul>
                  <li><b>Description: </b>adds an event listener for the myWebject instance where the possible events are <code>edit</code>, <code>connect</code> and <code>disconnect</code>. An edit occurs when an object is edited, and the connect and disconnect events occur on when users connect and disconnect to and from authTokens</li>
                  <li><b>Returns: </b>
<pre>
undefined
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>event </b><code>String (either "edit", "connect" or "disconnect")</code> The type of <a href="#event">event</a> to listen to</li>
                      <li><b>yourReaction </b><code>function</code> A function that responds to when an <a href="#event">event</a> occurs</li>
                    </ul>
                  </li>
                </ul>
              </details>
            </li>
            <!---->
            <li>
              <details>
                <summary><code>endListener(event,yourReaction)</code></summary>
                <ul>
                  <li><b>Description: </b>Ends an event listener for the myWebject instance where the possible events are <code>edit</code>, <code>connect</code> and <code>disconnect</code>. An edit occurs when an object is edited, and the connect and disconnect events occur on when users connect and disconnect to and from authTokens</li>
                  <li><b>Returns: </b>
<pre>
undefined
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>event </b><code>String (either "edit", "connect" or "disconnect")</code> The type of <a href="#event">event</a> being listen to</li>
                      <li><b>yourReaction </b><code>function</code> A function that was responding to when an <a href="#event">event</a> occurs</li>
                    </ul>
                  </li>
                </ul>
              </details>
            </li>
            <!---->
            <li>
              <details>
                <summary><code>addToken(filter[,object[,specificToken[,coding]]])</code></summary>
                <ul>
                  <li><b>Description: </b>Configures an <a href="#token">authToken</a> with a given <code>filter</code> (used to control user edits), an optional <code>object</code> or the one passed in when calling the <code>serve</code> function, a <code>specificToken</code> of your choice or one generated for you, then the <code>coding</code> which is used for custom encoding/decoding</li>
                  <li><b>Returns: </b>
<pre>
the string value of the authToken generated (either specificToken or one that was generated for you)
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>filter </b><code>Number or function</code> Manages/controls the edits that a user connected via this authToken attempts to make (if number, 1 for no edits, 2 for only adding new values[not modifying or deleting] or 3 for all edits, else a custom function that would return true if a specific edit is allowed)</li>
                      <li><b>object </b><code>Object</code> The object that users connected via this <a href="#token">authToken</a> will connect to (the one given here, else the one given in the serve function)</li>
                      <li><b>specificToken </b><code>String</code> A unique key that is the string <a href="#token">authToken</a> that users can connect to an object by</li>
                      <li><b>coding </b><code>Object</code> Defines <a href="#coding">custom encoding scheme</a>, therefore if a user connects and doesn't have the same encoding scheme, they'd be unable to process the shared object and be booted</li>
                    </ul>
                  </li>
                </ul>
              </details>
            </li>
            <!---->
            <li>
              <details>
                <summary><code>endToken(authToken)</code></summary>
                <ul>
                  <li><b>Description: </b>Ends support of the given string authToken that users were able to connect to an object by</li>
                  <li><b>Returns: </b>
<pre>
Boolean (true)
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>authToken </b><code>String</code> The unique key that is the string <a href="#token">authToken</a> that users were able to connect to an object by</li>
                    </ul>
                  </li>
                </ul>
              </details>
            </li>
            <!---->
            <li>
              <details>
                <summary><code>lock(authToken)</code></summary>
                <ul>
                  <li><b>Description: </b>Prevents new connections to the given authToken</li>
                  <li><b>Returns: </b>
<pre>
Boolean (true)
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>authToken </b><code>String</code> The unique key that is the string <a href="#token">authToken</a> that users were able to connect to an object by</li>
                    </ul>
                  </li>
                </ul>
              </details>
            </li>
            <!---->
            <li>
              <details>
                <summary><code>unlock(authToken)</code></summary>
                <ul>
                  <li><b>Description: </b>Allows new connections to the given authToken</li>
                  <li><b>Returns: </b>
<pre>
Boolean (true)
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>authToken </b><code>String</code> A unique key that is the string <a href="#token">authToken</a> that users can connect to an object by</li>
                    </ul>
                  </li>
                </ul>
              </details>
            </li>
            <!---->
          </ul>
        </details>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>object </b><code>object (default is {})</code>The default object that will be served when <code>addToken</code> is called without a specified object</li>
          </ul>
          <ul>
            <li><b>server </b><code>instance of http.createServer</code>The server(instance of <a href="https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener">http.createServer</a>) that the websocket will be existing on, or one created on port 8009</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <li>
    <details>
      <summary><code>connect(location,authToken[,obj[,coding[,onFail]]])</code></summary>
      <ul>
        <li><b>Description: </b>An asynchronous function that connects to and when resolved, returns an object that is hosted on a websocket with a specified authToken</li>
        <li><b>Returns: </b>
<pre>
A promise that when resolved, returns an object that is hosted on a websocket with a specified authToken
</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>location </b><code>String (ws or wss protocol)</code> The remote destination's WebSocket URL for the object</li>
            <li><b>authToken </b><code>String</code> The remote destination's <a href="#token">authToken</a> for the object</li>
            <li><b>obj </b><code>Object</code> A local, given, custom object that will be modified by the contents of the server's object</li>
            <li><b>coding </b><code>Object</code> Defines <a href="#coding">custom encoding scheme</a>; used for when the server has the same custom encoding scheme and thus the user would understand the server</li>
            <li><b>onFail </b><code>function (true by default)</code> This is called when disconnected from the websocket (whether the initial connect fails or some time after, the connection was cut) typically used for reconnection. It is <code>true</code> by default which means it will be a reconnection function by default. If you put your own function in, it should return a connect promise to simulate reconnection, however set it as <code>false</code> to disable automatic reconnection</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <!---->
  <li>
    <details>
      <summary><code>objToString(obj[,noCache])</code></summary>
      <ul>
        <li><b>Description: </b>Converts an object to an array which is a series stringified array of <a href="#part">part</a>s</li>
        <li><b>Returns: </b>
<pre>
String
</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>obj </b><code>Object</code> The object that will be serialised/stringified</li>
            <li><b>noCache </b><code>Boolean (false)</code> Determines if to rely on the previous state of the object(false) or not(true). It is false at default because it is usually more efficient to only share the differences/changes of the object in question</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <!---->
  <li>
    <details>
      <summary><code>stringToObj(string[,obj[,constraint]])</code></summary>
      <ul>
        <li><b>Description: </b>Modifies an object based on the string given, filtered by the constraint given, then returns that object. If no object was given, an empty object would be created and modified with that string</li>
        <li><b>Returns: </b>
<pre>
Object
</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>string </b><code>String</code> Serialised/stringified array of <a href="#part">part</a>s</li>
            <li><b>obj </b><code>Object</code> The object to modify based on the string filtered by the constraint</li>
            <li><b>constraint </b><code>Number OR Function</code> If it is a number, 1(for view only), 2(for only adding new keys and not modifying or deleting any), 3(any and all edits) or a a custom function that deals with each <b>part</b></li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <!---->
  <li>
    <details>
      <summary><code>sync(filePath[,obj[,coding]])</code></summary>
      <ul>
        <li><b>Description: </b>A function that persistently saves a given object upon each change. Note that it will try to modify the given object from what is at the fileName first then write the object's contents to the fileName. If no object is given, it will be exactly what can be built from the contents in filePath or an empty object</li>
        <li><b>Returns: </b>
<pre>
Object

- if syncList already includes filePath, the syncList's object already stored
one to one relation between a unique object and a unique filePath is how sync function works
do not worry about "should I desync when finished using sync" because there is a counter acting as the amount of times the function was called with a unique filePath

- else if obj was given
--  if filePath has webject serialised/stringified content, obj modified by contents of filePath
--  else, the unmodified obj

- else (obj was NOT given)
--  if filePath has webject serialised/stringified content, solely the parsed value of filePath contents
--  else, an empty object {}
</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>filePath </b><code>String</code> The FULL system file path (the saved file would be <code>filePath+'.json'</code></li>
            <li><b>obj </b><code>Object</code> The object to be synchronised to the filePath</li>
            <li><b>coding </b><code>Object</code> Defines a <a href="#coding">custom encoding scheme</a></li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <!---->
  <li>
    <details>
      <summary><code>desync(filePath)</code></summary>
      <ul>
        <li><b>Description: </b>Terminates the synchronisation of an object to a given filePath (or simply decrements a counter discussed in <b>sync</b>)</li>
        <li><b>Returns: </b>
<pre>
undefined
</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>filePath </b><code>String</code> The FULL system file path</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <!---->
  <li>
    <details>
      <summary><code>partFilter(manditoryPath[,allowEdits])</code></summary>
      <ul>
        <li><b>Description: </b>Creates a custom filter function that will only accept an edit from a <a href="#part">part</a> inside a certain manditoryPath</li>
        <li><b>Returns: </b>
<pre>
Function (the filter function)
</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>manditoryPath </b><code>String[]</code> The path in the object in which edits will be accepted (only data inside/under this path gets edited)</li>
            <li><b>allowAllEdits </b><code>Boolean(false)</code> Everything inside/under the given manditoryPath is treated like the number 2 filter(only new keys, no edits or deletions) WHEN FALSE. When true, all edits inside manditoryPath are allowed (like the number 3 filter)</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <!---->
  <li>
    <details>
      <summary><code>setConsistency(object[,isConsistent])</code></summary>
      <ul>
        <li><b>Description: </b>Declares if an object is safe for saving to disk, which the <code>sync</code> function checks this after each edit before saving file and would only save if consistency is true, however do note that <b>consistency of an object is true by default</b></li>
        <li><b>Returns: </b>
<pre>
undefined
</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>object </b><code>Object</code> An object that you are using <code>sync</code> on and wish to enforce atomicity and consistency on</li>
            <li><b>isConsistent </b><code>Boolean</code> true means that the <code>sync</code> function can save the object to a file now, false means to not save the object to a file yet</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
</ul>

# Structures
## Event
Let's look at what is given to `yourReaction` when you call the `addListener` function (which is a method of what is returned after calling the `serve` function)
```
{
  token: Object, //an authToken's object or null
  socket: Object, //a websocket client object or null
  type: String, //a string(either "edit", "connect", or "disconnect")
  lock: Function, //prevents more connections to an authToken passed in OR this event's token.authToken if called with none given
  unlock: Function, //allows new connections to an authToken passed in OR this event's token.authToken if called with none given
  preventDefault: Function //stops passing the event to other listeners after (the listener that calls this will be the last listener to see the event)
}
```
The `or null` parts with `token` and `socket` only apply to if the event is of _type_ **edit**.<br>
These would be null when an edit on an object occured on the server side, thus there is no client token and socket related/responsible for the event

## Token
The authToken _object_, highly integral to this repository because authTokens configure and define how others connect/sync to your objects.<br>
Let's look at its structure
```
{
  authToken: String,
  filter: Number OR Function,
  clients: Map,
  object: Object,
  locked: Boolean,
  dispatch: Function,
  encoder: Function OR null,
  decoder: Function OR null
}
```
This is authToken string, next is a filter which is either 1,2,3 or a function that would filter every **part** of an incoming edit, followed by a Map of websocket connections to this authToken, followed by the object that this authToken is meant to shared, followed by if it's locked, then a dispatch function responsible for this authToken (many authTokens might have the same dispatcher responsible for it), followed by an optional encoder and decoder for custom encoding.

## Part
What is meant by **part**? `objToString(someObj)` always returns `JSON.stringify(someArray)` where *someArray* is made up of **part**s. Each *part* comes in the format
```
the value in ONE index(part) of an objToString array are 1 of the following types:

[path] //delete
[path,data] //value
[path,refPath,num] //reference
[path,data,0,tag] //custom datatype value

- path is array of strings to represent a location
- data is an instance of a datatype to represent a value
- refPath is an index to a referred path located in another index(part) or the path array itself
- num is a number which can be 3 options: 0=not mentioned, 1=mentioned as path, 2=mentioned as reference
- tag is the [Symbol.toStringTag] property of a value and is used for TypedArray, BigInt, Symbol and undefined(which has no [Symbol.toStringTag] but isn't JSON)
```

## Coding
This is an object of two functions: `encode` and `decode`. Each function must be robust since they can receive _and also_ return ONE of two types of data: either **string** or **buffer**. In essence, they must have accomodations for two data types. Only one argument is given, data.
```
{
  function encoder(data/*instanceof Buffer or String*/){return an instanceof Buffer or String},
  function decoder(data/*instanceof Buffer or String*/){return an instanceof Buffer or String},
}
```