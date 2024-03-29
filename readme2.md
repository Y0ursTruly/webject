# Webject
Share (and sync) Objects Online with the power of websockets. Keys, Values AND References. Webject is short for Web Object and it really is a system for sharing objects on the web. Someone can host an object, then create and configure an authToken, enabling clients to connect to the object with the permissions/constraints defined by the respective authToken it a client connects with. Why Webject? This tool has usage for whenever one wishes to either collaborate on or simply share/sync real time data remotely with ease >:D
<br>
- **Please note**: Please ensure that the same version of *webject* is used across the different points/ends of your application that use it
# Installation
Three ways
- *[Download Github Package as ZIP](https://github.com/Y0ursTruly/webject/archive/refs/heads/main.zip)*
- `git clone https://github.com/Y0ursTruly/webject.git`
- `npm install webject`
# Importing
```
const {serve, connect, sync, desync, objToString, stringToObj, objValueFrom} = require("webject");
```
# Modules
<ul>
  <li>
    <details>
      <summary><code>serve([object[,server]])</code></summary>
      <ul>
        <li><b>Description: </b>Creates a websocket and returns methods for configuring <code>authTokens</code> to share objects</li>
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
                      <li><b>event </b><code>String (either "edit", "connect" or "disconnect")</code> The type of event to listen to</li>
                      <li><b>yourReaction </b><code>function</code> A function that responds to when an event occurs</li>
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
                  <li><b>Description: </b>ends an event listener for the myWebject instance where the possible events are <code>edit</code>, <code>connect</code> and <code>disconnect</code>. An edit occurs when an object is edited, and the connect and disconnect events occur on when users connect and disconnect to and from authTokens</li>
                  <li><b>Returns: </b>
<pre>
undefined
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>event </b><code>String (either "edit", "connect" or "disconnect")</code> The type of event being listen to</li>
                      <li><b>yourReaction </b><code>function</code> A function that was responding to when an event occurs</li>
                    </ul>
                  </li>
                </ul>
              </details>
            </li>
            <!---->
            <li>
              <details>
                <summary><code>addToken(filter[object[,specificToken[,coding]]])</code></summary>
                <ul>
                  <li><b>Description: </b>configures an authToken with a given <code>filter</code> (used to control user edits), an optional <code>object</code> or the one passed in when calling the <code>serve</code> function, a <code>specificToken</code> of your choice or one generated for you, then the <code>coding</code> which is used for custom encoding/decoding</li>
                  <li><b>Returns: </b>
<pre>
the string value of the authToken generated (either specificToken or one that was generated for you)
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>filter </b><code>number or function</code> Manages/controls the edits that a user connected via this authToken attempts to make (if number, 1 for no edits, 2 for only adding new values[not modifying or deleting] or 3 for all edits, else a custom function that would return true if a specific edit is allowed)</li>
                      <li><b>object </b><code>Object</code> The object that users connected via this authToken will connect to (the one given here, else the one given in the serve function)</li>
                      <li><b>specificToken </b><code>String</code> A unique key that is the string authToken that users can connect to an object by</li>
                      <li><b>coding </b><code>Object</code> Defines custom encoding scheme, therefore if a user connects and doesn't have the same encoding scheme, they'd be unable to process the shared object and be booted</li>
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
                  <li><b>Description: </b>ends support of the given string authToken that users were able to connect to an object by</li>
                  <li><b>Returns: </b>
<pre>
Boolean (true)
</pre>
                  </li>
                  <li><b>Arguments: </b>
                    <ul>
                      <li><b>authToken </b><code>String</code> The unique key that is the string authToken that users were able to connect to an object by</li>
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
                      <li><b>authToken </b><code>String</code> The unique key that is the string authToken that users were able to connect to an object by</li>
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
                      <li><b>authToken </b><code>String</code> A unique key that is the string authToken that users can connect to an object by</li>
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
      <summary><code>connect(location,authToken[onFail[,obj[,coding]]])</code></summary>
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
            <li><b>authToken </b><code>String</code> The remote destination's authToken for the object</li>
            <li><b>onFail </b><code>function</code> This is called when disconnected from the websocket (whether the initial connect fails or some time after, the connection was cut)</li>
            <li><b>obj </b><code>Object</code> A local, given, custom object that will be modified by the contents of the server's object</li>
            <li><b>coding </b><code>Object</code> Defines custom encoding scheme; used for when the server has the same custom encoding scheme and thus the user would understand the server</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <!-- functions left: objToString, stringToObj, sync, desync -->
</ul>

# Structures
## Events
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