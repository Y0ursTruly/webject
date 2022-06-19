//-when sharing an object there are three authorisation levels
//remember, making tokens is as easy as myWebject.addToken(authLevel)
/*---*/
//authLevel 1: clients with this authToken level can only view the shared object
//authLevel 2: clients with this authToken level can only ADD new entries to the shared object
//authLevel 3: clients with this authToken level can modify the object in basically any way(adding, removing, modifying)
/*---*/
//since you're reading here.. my email is paulrytaylor@gmail.com
//do contact me if you have any questions >:D
/*---*/
/*
//for including my script with your html page(the line below)
<script src="https://raw.githubusercontent.com/Y0ursTruly/webject/master/webject.js"></script>
//for including my script through browser console pasting
(()=>{
  //yes eval the github script because CORB blocks githubusercontent.com
  fetch("https://raw.githubusercontent.com/Y0ursTruly/webject/master/webject.js").then(x=>x.text().then(eval))
  //when webject is ready, window would have the webject functions (stringToObj,objToString,connect)
  Object.defineProperty(window,'connect',{set:value=>{
    Object.defineProperty(window,'connect',{value})
    //over here, webject is ready for your browser tab, meaning that you can use webject functions
    //for instance, you can replace this line calling a function that uses webject
  },configurable:true})
})()
//for github, git clone https://github.com/Y0ursTruly/webject.git and require('path/to/webject.js')
//for npm, npm install webject and require('webject')
*/
(()=>{



try{ //for nodejs
  var webSocket=require('ws'); var fs=require('fs')
  var {objToString,stringToObj}=require(__dirname+'/serial.js')
}
catch{ //for browser
  var webSocket=WebSocket
  webSocket.prototype.on=webSocket.prototype.addEventListener
}

let syncList={} //sync list for records of syncing
let randList={} //this block here is for recording random UNIQUE keys(per webject instance)
let map=new WeakMap() //the map is for only having 1 string AND interval per object
var arr=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t",
"u","v","w","x","y","z",0,1,2,3,4,5,6,7,8,9,"!","@","$","&","*","(","-","_","=","+","[","]","~"]
function randomChar(n){ //creates randomised tokens(that start with "webject_")
  var m=Math.random, f=Math.floor, newChar="webject_" //all default authTokens begin with webject_
  function notUnique(){
    for(var i=0; i<f(m()*100+n); i++){ newChar+=arr[f(m()*arr.length)] }
    return randList[newChar]
  }
  while(notUnique()){newChar="webject_"} //try UNTIL it's unique 
  randList[newChar]=1 //so that this key won't repeat
  return newChar
}
function dispatchEdit(myMap){
  myMap.dispatchList.forEach(dispatch=>{
    dispatch.tokenList.forEach(token=>dispatch("edit",token,null))
  })
}
function addMapping(obj,token,dispatch){ //token is the authToken object
  let myMap=map.get(obj)
  if(!myMap){ //then set the mapping object
    myMap={string:objToString(obj),tokenLists:{[token.authToken]:token},dispatchList:[dispatch]}
    myMap.interval=setInterval(()=>{
      let deleted=Object.values(myMap.tokenLists).every(token=>token.deleted)
      if(deleted){ clearInterval(myMap.interval);map.delete(obj);return myMap=null }
      let currentString=objToString(obj)
      if(currentString!=myMap.string){
        let toSend=objToString(obj,null,null,token.minimal?myMap.string:false)
        Object.values(myMap.tokenLists).forEach(token=>{
          token.clients.forEach(client=>client.send(toSend))
        })
        myMap.string=currentString; dispatchEdit(myMap)
      }
      currentString=null
    },0)
    myMap.sendEdit=(edit,sender)=>{
      Object.values(myMap.tokenLists).forEach(token=>{
        token.clients.forEach(client=>{ if(client!=sender){client.send(edit)} })
      })
      dispatchEdit(myMap)
    }
    map.set(obj,myMap)
  }
  else{
    myMap.tokenLists[token.authToken]=token
    if(!myMap.dispatchList.includes(dispatch)){myMap.dispatchList.push(dispatch)}
  }
}
function createToken(authToken,authLevel,object,minimal,dispatch){ //creates the authToken object
  const toReturn={authToken,authLevel,clients:[],object,locked:false,minimal}
  addMapping(object,toReturn,dispatch) //creates map of object(if not done already) then appends the clients array
  let getString=()=>map.get(object).string
  let setString=(str)=>map.get(object).string=str
  Object.defineProperty(toReturn,"string",{get:getString,set:setString})
  return toReturn //to return is the structure for each authToken object in authTokens
}

//this block here is for comparing 2 object strings(to see if level 2 authToken can apply their changes)
function findMatch(elem,obj2){
  let path=JSON.stringify(elem.path), location=null
  obj2.forEach(a=>{ if(path==JSON.stringify(a.path)){location=a} })
  if(!location){return location} //null
  if(location.value){return location} //direct value
  return obj2[location.reference] //because sometimes a path can be a reference
}
let cmp=(found,a)=>JSON.stringify(found.value)!=JSON.stringify(a.value)
function compare(str1,str2,minimal){ //str1 is the home obj, str2 is the client desired obj
  var toReturn=true, obj1=JSON.parse(str1), obj2=JSON.parse(str2)
  obj1.forEach(a=>{
    var found=findMatch(a,obj2)
    if((found?cmp(found,a):true)&&!minimal){toReturn=false}
    else if(found?cmp(found,a)||found.delete:false){toReturn=false}
  })
  obj1=null; obj2=null; return toReturn
}

//serve an object
function serve(obj,server){ //serve an object(synchronous because this IS the server clients wait to connect to)
  if(typeof obj!="object"||obj==null){throw new Error("Parameter 'obj' MUST be an OBJECT >:|")}
  try{var ws=new webSocket.Server({server})}
  catch{
    try{var ws=new webSocket.Server({port:8009})}
    catch{throw new Error("UNABLE TO SERVE >:{")}
  }
  var authTokens={}, levels={1:1,2:1,3:1}
  //utility functions begin
  function addToken(authLevel,object,specificToken,notMinimal){ //authToken adder
    var minimal=!notMinimal //for every token, if minimal is true, data transit is faster(minimal is default)
    if(typeof object!="object"||object==null){object=obj} //can share one object per authToken
    if(!levels[authLevel]){
      throw new Error("INVALID AUTH LEVEL\nAuthorisation levels are 1, 2 and 3 :/")
    }
    if(typeof specificToken!="string" && specificToken){
      throw new Error("If specificToken parameter is used, it MUST be a string ;-;")
    }
    if(authTokens[specificToken]){
      throw new Error("If specificToken parameter is used, it MUST be a UNIQUE token ;-;")
    }
    if(typeof specificToken=="string"){var authToken=specificToken} //specificToken chosen as authToken
    else{
      var authToken=randomChar(15) //random token generation(by default)
      while(authTokens[authToken]){ authToken=randomChar(15) } //user tokens don't get stored in randList
      //so by now.. I've making sure that authToken is UNIQUE
    }
    authTokens[authToken]=createToken(authToken,authLevel,object,minimal,dispatch)
    dispatch.tokenList.push(authTokens[authToken])
    return authToken
  }
  function endToken(authToken){ //authToken remover
    try{
      authTokens[authToken].deleted=true
      authTokens[authToken].clients.forEach(a=>a.close(1000))
      let index=dispatch.tokenList.indexOf(authTokens[authToken])
      dispatch.tokenList.splice(index,1)
      return delete(authTokens[authToken])
    }
    catch{throw new Error("INVALID TOKEN(as in it doesn't exist) :/")}
  }
  function lock(authToken){
    if(authToken){
      try{authTokens[authToken].locked=true}
      catch{throw new Error("PLEASE give a VALID authToken(given token doesn't exist) 0_0")}
    }
    else{
      try{this.token.locked=true}
      catch{throw new Error("PLEASE give an authToken which is of type STRING 0_0")}
    }
    return true //action was successful
  }
  function unlock(authToken){
    if(authToken){
      try{authTokens[authToken].locked=false}
      catch{throw new Error("PLEASE give a VALID authToken(given token doesn't exist) 0_0")}
    }
    else{
      try{
        if(this.token==null){return false} //action unsuccessful because token is null(due to failed authentication or token ended)
        this.token.locked=false
      }
      catch{throw new Error("PLEASE give an authToken which is of type STRING 0_0")}
    }
    return true //action was successful
  }
  //utility functions end
  //event stuff begin
  var events={connect:[],disconnect:[],edit:[]} //more events will come in time
  function dispatch(type,token,socket){
    var defaultPrevented=false
    let preventDefault=()=>defaultPrevented=true
    var customEvent={token,socket,type,lock,unlock,preventDefault}
    customEvent.lock=lock.bind(customEvent); customEvent.unlock=unlock.bind(customEvent)
    let warn="an added listener produced the following error :/\n~"
    events[type].forEach(a=>{
      if(!defaultPrevented){
        try{a(customEvent)} catch(err){console.warn(warn,err)}
      }
    })
  }
  dispatch.tokenList=[] //for the mapping system, it is recorded, the tokens in dispatch "view"
  function addListener(event,yourReaction){
    if(typeof event!="string"||typeof yourReaction!="function"){
      throw new Error("The event parameter MUST be a STRING\nAND the yourReaction parameter MUST be a FUNCTION >:|")
    }
    if(!events[event]){throw new Error("That event DOES NOT EXIST :|")}
    events[event].push(yourReaction)
  }
  function endListener(event,yourReaction){
    if(typeof event!="string"||typeof yourReaction!="function"){
      throw new Error("The event parameter MUST be a STRING\nAND the yourReaction parameter MUST be a FUNCTION >:|")
    }
    if(!events[event]){throw new Error("That event DOES NOT EXIST :|")}
    let indexOfReaction=events[event].indexOf(yourReaction)
    if(indexOfReaction!=-1){events[event].splice(indexOfReaction,1)}
  }
  //event stuff end
  //websocket block begin
  ws.on('connection',(client)=>{
    let clientMsgCount=0, token=null, dispatchEdit=(msg)=>map.get(token.object).sendEdit(msg,client)
    function closeClient(){ //to ensure socket cleanup
      let indexOfClient=token.clients.indexOf(client)
      if(indexOfClient!=-1){token.clients.splice(indexOfClient,1)}
      try{ client.close(1000) }catch{} //the client could be closed already
      dispatch("disconnect",token||null,client) //if endToken was used, the ev.token value would be null
    }
    client.on('message',(msg)=>{
      if(clientMsgCount==0){ //first message is handshake
        if(!authTokens[msg]){return client.close(1000)} //if you client doesn't have a valid token, they get closed
        if(authTokens[msg].locked){return client.close(1001)} //if authToken is locked, no more new connections
        token=authTokens[msg]
        client.send(token.string)
        token.clients.push(client)
        dispatch("connect",token,client)
      }
      else{ //listen to client if authLevel > 1 AND serial difference
        let myAuthLevel=token.authLevel //authLevel 1 would be ignored(can only view)
        if(myAuthLevel>1&&token.string!=msg){try{
          if(myAuthLevel==3){ //authLevel 3 unfiltered edits
            stringToObj(msg,token.object,token.minimal); token.string=objToString(token.object); dispatchEdit(msg)
          }
          else if(compare(token.string,msg,token.minimal)){ //authLevel 2 can only add, therefore compare function
            stringToObj(msg,token.object,token.minimal); token.string=objToString(token.object); dispatchEdit(msg)
          }
        }catch(err){console.log(err)/*purposeful or not, unwanted data can be sent and read with error*/}}
      }
      clientMsgCount++
    })
    //in any of the 3 below cases, it's time for this client to get closed
    client.on('disconnect',closeClient)
    client.on('close',closeClient)
    client.on('error',closeClient)
  })
  //websocket block end
  let toReturn={authTokens,addToken,endToken,lock,unlock,addListener,endListener}
  Object.keys(toReturn).forEach(key=>{
    if(typeof toReturn[key]=="function"){toReturn[key]=toReturn[key].bind(toReturn)}
  })
  return toReturn //the function binding you would've seen is to maintain the functions' purpose(even after destructuring)
}

//connect to an object
async function connect(location,authToken,onFail,notMinimal){ //receive an object(asynchronous to wait for connection with server)
  var minimal=!notMinimal //for every token, if minimal is true, data transit is faster(minimal is default)
  if(typeof location!="string"||typeof authToken!="string"){throw new Error("BOTH location AND authToken MUST be STRINGS >:|")}
  if(typeof onFail!="function"&&onFail){throw new Error("If you choose the optional parameter onFail, it must be a function >:|")}
  let obj={}, toReturn=null, toReject=null, s=null
  let server=await new webSocket(location)
  server.onerror=(err)=>{
    console.error("Attempting to connect to a websocket using the location parameter produced the following error :/\n~",err.message)
    if(onFail){onFail()} //if connecting fails, function is called(if given)
  }
  let p=new Promise((r,j)=>{toReturn=r; toReject=j}), staticString=""
  function disconnectHandle(event,name){
    let code=event, disconnectReason=null
    if(isNaN(code)){code=event.code}
    if(code==1006){disconnectReason="closed ABNORMALLY: either you or the server just LOST connection :|"}
    else if(code==1001){disconnectReason="authToken LOCKED: this is a correct key, but it takes no new connections 0_0"}
    else{disconnectReason="closed PURPOSEFULLY: check your location and token parameters, OR you got BOOTED :/"}
    let errorMessage=`connection with server is OVER due to event: ${name}\n${disconnectReason}`
    if(toReturn){toReject(errorMessage)}else{console.error(errorMessage)}
    /*if the promise is NOT fulfiled, reject.. else, warn*/
    clearInterval(s) //of course, cleaning out this interval
    if(onFail){onFail()} //onFail function can be used for repeating task until connection
  }
  server.on('open',()=>{
    let serverMsgCount=0
    server.send(authToken)
    function handleObj(){ //sends object data to server
      let currentString=objToString(obj)
      if(currentString!=staticString){ 
        if(!minimal){ server.send(objToString(obj)) }
        else{server.send( objToString(obj,null,null,staticString) )}
      }
      staticString=currentString; currentString=null
      //override only works if authToken's authLevel is 3
      /*however there is no way for the client to know the authLevel of the authToken provided*/
    }
    server.on('message',(msg)=>{
      if(typeof msg=="object"){msg=msg.data} //this solves browser issues
      if(serverMsgCount==0){toReturn(true);toReturn=null;s=setInterval(handleObj,0)}
      stringToObj(msg,obj,minimal);staticString=objToString(obj) //server object data is absolute
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

//sync object to filePath
function sync(obj,filePath,spacing){
  //error block 1 begin
  var errors=[]; let yesOrNo={true:"errors",false:"error"}
  if(typeof obj!="object"){errors.push("obj MUST be an OBJECT >:|")}
  if(typeof filePath!="string"){errors.push("filePath MUST be a STRING >:{")}
  if(spacing&&typeof spacing!="string"){errors.push("spacing (if used) MUST be a STRING >:[")}
  if(errors.length){throw new Error(`A total of ${errors.length} ${yesOrNo[errors.length]} generated ;-;\n${errors.join("\n")}`)}
  //error block 1 end
  //error block 2 begin
  try{fs.writeFileSync(filePath,fs.readFileSync(filePath))}
  catch{
    try{fs.writeFileSync(filePath,objToString(obj,spacing))}
    catch(err){throw new Error("Using this filePath caused an error ;-;\n~",err)}
  }
  //error block 2 end
  
  var string=()=>objToString(obj,spacing)
  var staticString=string()
  const syncID=setInterval(()=>{
    let testString=string()
    if(testString!=staticString){
      staticString=testString
      try{fs.writeFileSync(filePath,staticString)}
      catch(err){throw new Error(`This is strange.. suddenly, writing to ${filePath} is causing an error :?\n~`,err)}
    }
  },0)
  syncList[syncID]=true; return syncID
}

//desyc object from filePath
function desync(syncID){
  if(!syncList[syncID]){throw new Error("INVALID syncID *-*")}
  delete(syncList[syncID]); clearInterval(syncID)
}

try{module.exports={serve, connect, sync, desync, objToString, stringToObj}} //for nodejs
catch{ //for browser
  console.log("Part 1/2 loaded ^-^")
  fetch("https://raw.githubusercontent.com/Y0ursTruly/webject/master/serial.js").then(x=>x.text().then(eval))
  Object.defineProperty(window,'stringToObj',{set:value=>{
    Object.defineProperty(window,'stringToObj',{value})
    window.connect=connect
  },configurable:true})
}



})()
