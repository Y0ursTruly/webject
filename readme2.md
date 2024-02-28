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
      <summary><code>makeTest([tries[,B[,a1[,a2]]]])</code></summary>
      <ul>
        <li><b>Description: </b>This function generates a cryptographic quiz based on the arguments given. Arguments in this function have <a href="https://github.com/Y0ursTruly/pow_captcha/blob/master/pow.js#L221">these constraints</a></li>
        <li><b>Returns: </b>
<pre>[
  string that looks like garbage but is the cryptographic quiz(hash of correct buffer, incorrect buffer, ranges of where to modify when guessing),
  string that looks like garbage but is the SOLUTION of the given cryptographic quiz(the correct buffer)
]</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>tries </b><code>number (default is 16^4)</code> The maximum amount of combinations(of the buffer) that might get guessed before arriving at the solution. In the cryptographic quiz, this is expressed in one or more ranges that multiply up to this number</li>
            <li><b>B </b><code>number (default is 1024)</code> The length of the buffer. This will not affect tries because specific ranges across the buffer are chosen, but it prevents an attacker from prehashing all combinations of the buffer</li>
            <li><b>a1 </b><code>number (default is 0)</code> The lowest value a byte can be. For example if a1 is 65, there will be no byte less than 'A' in the buffer</li>
            <li><b>a2 </b><code>number (default is 256)</code> The highest value a byte can be plus one. For example if a2 is 91, there will be no byte greater than 'Z' in the buffer</li>
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