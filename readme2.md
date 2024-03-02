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
<pre>{
  authTokens, //Map
  addListener, //function
  endListener, //function
  addToken, //function
  endToken, //function
  lock, //function
  unlock, //function
}</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>object </b><code>object (default is {})</code>The default object that will be served when <code>addToken</code> is called without a specified object</li>
          </ul>
          <ul>
            <li><b>server </b><code>instance of http.createServer</code>The server(instance of [http.createServer](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener)) that the websocket will be existing on, or one created on port 8009</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <li>
    <details>
      <summary><code>takeTest(input)</code></summary>
      <ul>
        <li><b>Description: </b>This function solves a cryptographic quiz based on the string input given</li>
        <li><b>Returns: </b>
<pre>string that looks like garbage but is the SOLUTION of the given cryptographic quiz(the correct buffer)</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>input </b><code>string</code> A string which is a cryptographic quiz</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <li>
    <details>
      <summary><code>takeTestAsync(input)</code></summary>
      <ul>
        <li><b>Description: </b>To avoid hanging the process that called it, this runs the takeTest function in a worker thread</li>
        <li><b>Returns: </b>
<pre>string that looks like garbage but is the SOLUTION of the given cryptographic quiz(the correct buffer)</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>input </b><code>string</code> A string which is a cryptographic quiz</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
</ul>
