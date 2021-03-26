//when sharing an object there are three authorisation levels
//remember, making tokens is as easy as myWebject.addToken(authLevel)
/*---*/
//authLevel 1: clients with this authToken level can only view the shared object
//authLevel 2: clients with this authToken level can only ADD new entries to the shared object
//authLevel 3: clients with this authToken level can modify the object in basically any way(adding, removing, modifying)
/*---*/
//do tell me if I should split authLevel 3 into 2 categories(my email is paulrytaylor@gmail.com)
//these categories would be having authLevel 3 to have [add and modify] and then authLevel 4 would have [add, modify AND remove]
/*---*/
/*
//for including my script with your html page(the line below)
<script src="https://cdn.jsdelivr.net/npm/webject@latest/webject.js"></script>
//for including my script through browser console pasting
(()=>{let script=document.createElement('script');script.src="https://cdn.jsdelivr.net/npm/webject@latest/webject.js";document.head.appendChild(script)})()
//for github, git clone https://github.com/Y0ursTruly/webject.git and require('path/to/webject.js')
//for npm, npm install webject and require('webject')
*/

try{ //for nodejs
  var webSocket=require('ws'); var index=0
  var {objToString,stringToObj}=require(__dirname+'/serial.js')
}
catch{ //for browser
  var webSocket=WebSocket; var index=0
  webSocket.prototype.on=webSocket.prototype.addEventListener
  let script=document.createElement('script')
  script.src="https://cdn.jsdelivr.net/npm/webject@latest/serial.js"
  document.head.appendChild(script)
}

let randList={} //this block here is for producing random UNIQUE keys
var arr=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t",
"u","v","w","x","y","z",0,1,2,3,4,5,6,7,8,9,"!","@","$","&","*","(","-","_","=","+","[","]","~"]
function randomChar(n){
  var m=Math.random; var f=Math.floor; var newChar="webject_" //all authTokens begin with webject_
  function notUnique(){
    for(var i=0; i<f(m()*100+n); i++){newChar+=arr[f(m()*arr.length)]}
    return randList[newChar]&&newChar.length>0
  }
  while(notUnique()){newChar=""} //try UNTIL it's unique
  randList[newChar]=1 //so that this key won't repeat
  return newChar
}

//this block here is for comparing 2 object strings(to see if level 2 authToken can apply their changes)
function compare(str1,str2){ //str1 is the home obj, str2 is the client desired obj
  var toReturn=true; var obj1=stringToObject(str1); var obj2=stringToObject(str2)
  function findMatch(elem){
    let path=JSON.stringify(elem.path); let location=null
    obj2.forEach(a=>{ if(path==JSON.stringify(a.path)){location=a} })
    if(location.value){return location}return obj2[location.reference] //because sometimes a path can be a reference
  }
  obj1.forEach(a=>{ if(findMatch(a).value!=a.value){toReturn=false} })
  return toReturn
}

function serve(obj,server){ //serve an object(synchonous because this IS the server clients wait to connect to)
  if(typeof obj!="object"){throw new Error("Parameter 'obj' MUST be an OBJECT")}
  const dontDeleteEntireObj=obj //just so that you can't delete the object entirely
  try{var ws=new webSocket.Server({server})}
  catch{
    try{var ws=new webSocket.Server({port:8009})}
    catch{throw new Error("UNABLE TO SERVE >:{")}
  }
  var authTokens={}
  let string=()=>objToString(obj)
  let staticString=string()
  function addToken(authLevel){ //token generator
    if(!{1:1,2:1,3:1}[authLevel]){
      throw new Error("INVALID AUTH LEVEL\nAuthorisation levels are 1, 2 and 3")
    }
    let authToken=randomChar(15)
    authTokens[authToken]={authToken,authLevel,clients:[]} //structure for each authToken object in authTokens
    return authToken
  }
  function endToken(authToken){ //token remover
    try{
      authTokens[authToken].clients.forEach(a=>a.close())
      delete(authTokens[authToken])
    }
    catch{throw new Error("INVALID TOKEN(as in it doesn't exist)")}
  }
  ws.on('connection',(client)=>{ //websocket block
    let clientMsgCount=0
    let s; let authToken
    function closeClient(){ //to ensure socket cleanup
      try{
        client.close(1000); let clients=authTokens[authToken].clients
        if(clients.includes(client)){clients.splice(clients.indexOf(client),1)}
      }catch{}
      clearInterval(s)
    }
    function handleObj(){ //sends object data to client
      let currentString=string()
      if(currentString!=staticString){
        staticString=currentString; client.send(staticString)
      }
    }
    client.on('message',(msg)=>{
      if(clientMsgCount==0){ //first message is handshake
        if(!authTokens[msg]){return client.close(1000)} //if you client doesn't have a valid token, they get closed
        authTokens[msg].clients.push(client)
        client.send(staticString); authToken=msg
        s=setInterval(handleObj,0)
      }
      else{ //listen to client if authLevel > 1 AND serial difference
        let myAuthLevel=authTokens[authToken].authLevel //authLevel 1 would be ignored(can only view)
        if(myAuthLevel>1&&staticString!=msg){try{
          if(myAuthLevel==3){return stringToObj(msg,obj)} //authLevel 3 unfiltered edits
          if(compare(staticString,msg)){stringToObj(msg,obj)} //authLevel 2 can only add, therefore compare function
        }catch{/*purposeful or not, unwanted data can be sent and read with error*/}}
      }
      clientMsgCount++
    })
    //in any of the 3 below cases, it's time for this client to get closed
    client.on('disconnect',closeClient)
    client.on('close',closeClient)
    client.on('error',closeClient)
  })
  return {authTokens,addToken,endToken}
}

async function connect(location,authToken){ //receive an object(asynchronous to wait for connection with server)
  if(typeof location!="string"||typeof authToken!="string"){throw new Error("BOTH location AND authToken MUST be STRINGS")}
  let obj={}; let toReturn=null
  let toReject=null; let s=null
  let server=new webSocket(location)
  let p=new Promise((r,j)=>{toReturn=r;toReject=j})
  function disconnectHandle(event,name){
    let code=event; let disconnectReason=null
    if(isNaN(code)){code=event.code}
    if(code==1006){disconnectReason="closed ABNORMALLY: either you or the server just LOST connection :|"}
    else{disconnectReason="closed PURPOSEFULLY: check your location and token parameters, OR you got BOOTED"}
    let errorMessage=`connection with server is OVER due to event: ${name}\n${disconnectReason}`
    if(toReturn){toReject(errorMessage)}else{console.warn(errorMessage)}
    /*if the promise is NOT fulfiled, reject.. else, warn*/
    clearInterval(s) //of course, cleaning out this timeout
  }
  let staticString=""
  server.on('open',()=>{
    let serverMsgCount=0
    server.send(authToken)
    function handleObj(){ //sends object data to server
      let currentString=objToString(obj)
      if(currentString!=staticString){server.send(currentString)} //override only works if authToken's authLevel is 3
      /*however there is no way for the client to know the authLevel of the authToken provided*/
    }
    server.on('message',(message)=>{
      let msg=message //for msg to be the same data(whether browser or nodejs)
      if(typeof msg=="object"){msg=msg.data} //this solves browser issues
      if(serverMsgCount==0){toReturn(true);toReturn=null;s=setInterval(handleObj,0)}
      if(msg!=staticString){staticString=msg;stringToObj(msg,obj)} //server object data is absolute
      /*Modifying this code properly would reject the server rules, to modify the object to your liking*/
      /*BUT the only object you can meddle with would be the one on YOUR device(it's like if you disconnected)*/
      /*In addition to that, you wouldn't even be sharing the object, since rejecting the server is as good as leaving the socket*/
      serverMsgCount++
    })
    server.on('disconnect',(ev)=>disconnectHandle(ev,'disconnect'))
    server.on('close',(ev)=>disconnectHandle(ev,'close'))
    server.on('error',(ev)=>disconnectHandle(ev,'error'))
  })
  await p; return obj
}

try{module.exports={serve,connect}} //for nodejs
catch{ //for browser
  serve=function(){
    let message="This SERVE function is not a browser side application\nCheck out https://npmjs.com/package/webject"
    console.warn(message); alert(message)
  }
  console.log("Oh, hi there >:D")
}
