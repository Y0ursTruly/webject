//when sharing an object there are three authorisation levels
//remember, making tokens is as easy as myWebject.addToken(authLevel)
/*---*/
//authLevel 1: clients with this authToken level can only view the shared object
//authLevel 2: clients with this authToken level can only ADD new entries to the shared object
//authLevel 3: clients with this authToken level can modify the object in basically any way(adding, removing, modifying)
/*---*/
(()=>{




  const webSocket=require('ws'), fs=require('node:fs'), path=require('node:path')
  const {objToString,stringToObj,partFilter,objValueFrom}=require(path.join(__dirname,'serial.js'))
  const crypto=require('node:crypto'), cmpStr=objToString({})
  
  let randList={__proto__:null} //this block here is for recording random UNIQUE keys
  let map=new WeakMap() //the map is for only having 1 string AND interval per object
  let random =_=> (crypto.webcrypto||crypto).getRandomValues(new Uint32Array(1))[0];
  let range =(max,min)=> (random()%(max-min))+min; //numeric range
  var arr='abcdefgjiklmnopqrstuvwxyz-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ :;.,\\/"\'?!(){}[]@<>=+*#$&`|~^%'.split('')
  
  function randomChar(n,defaultChar){
    if(typeof defaultChar!=="string") defaultChar="webject_"; //all default authTokens begin with webject_
    do{
      var str="", length=range(2*n,n)
      for(let i=0;i<length;i++) str+=arr[range(arr.length-1,0)];
      str=defaultChar+str;
    }while(randList[str]);
    randList[str]=1; //so that this key won't repeat
    return str;
  }
  function dispatchEdit(myMap,sender=null){
    myMap.tokens.forEach(function(_,token){
      token.dispatch("edit",token,sender)
    })
  }
  function addMapping(token){ //token is the authToken object
    let myMap=map.get(token.object)
    if(!myMap){ //then set the mapping object
      objToString(token.object,true)
      myMap={
        tokens:new Map([[token,1]]),
        interval:setInterval(function(){
          if(!myMap.tokens.size){
            clearInterval(myMap.interval)
            map.delete(token.object)
            return myMap=null
          }
          const toSend=objToString(token.object)
          if(toSend!==cmpStr){ //if there are edits
            myMap.tokens.forEach(async function(_,token){
              const msg=token.encoder?(await token.encoder(toSend)):toSend;
              token.clients.forEach(function(_,client){client.send(msg)})
            })
            dispatchEdit(myMap)
          }
        },20),
        sendEdit(toSend,sender){
          myMap.tokens.forEach(async function(_,token){
            let msg=token.encoder?(await token.encoder(toSend)):toSend;
            token.clients.forEach(function(_,client){
              if(client!==sender) client.send(msg);
            })
          })
          dispatchEdit(myMap,sender)
        }
      }
      map.set(token.object,myMap)
    }
    else{
      myMap.length++;
      myMap.tokens.set(token,1);
    }
  }
  function createToken(authToken,filter,object,dispatch,coding){ //creates the authToken object
    let token={authToken,filter,clients:new Map(),object,locked:false,dispatch,encoder:null,decoder:null}
    if(coding){
      token.encoder=coding.encoder
      token.decoder=coding.decoder
    }
    addMapping(token) //creates map of object(if not done already)
    return token //to return is the structure for each authToken object in authTokens
  }
  
  
  
  //serve an object
  function serve(obj={},server){ //serve an object(synchronous because this IS the server clients wait to connect to)
    if(typeof obj!=="object"||obj===null){throw new Error("Parameter 'obj' MUST be an OBJECT >:|")}
    try{var ws=new webSocket.Server({server})}
    catch{
      try{var ws=new webSocket.Server({port:8009})}
      catch{throw new Error("UNABLE TO SERVE >:{")}
    }
    var authTokens={__proto__:null}, levels={1:1,2:1,3:1,__proto__:null}, encodingStorage={__proto__:null}
    
    /*------------utility functions begin------------*/
    function addToken(filter,object,specificToken,coding){ //authToken adder
      if(typeof object!=="object"||object===null){object=obj} //can share one object per authToken
      if(!levels[filter]&&typeof filter!=="function")
        throw new RangeError("INVALID FILTER\nFilter MUST be either 1, 2, 3 OR a function :/");
      if(specificToken){
        if(typeof specificToken!=="string")
          throw new TypeError("If specificToken parameter is used, it MUST be a string ;-;");
        if(specificToken.length<8)
          throw new RangeError("The specificToken MUST be AT LEAST 8 characters long");
      }
      if(authTokens[specificToken]||randList[specificToken])
        throw new TypeError("If specificToken parameter is used, it MUST be a UNIQUE token ;-;");
      if(coding  &&  (typeof coding==="object"?typeof coding.encoder!=="function"||typeof coding.decoder!=="function":false)){
        throw new TypeError("If coding parameter is used, it MUST be an object with both 'encoder' and 'decoder' functions")
      }
      if(typeof specificToken==="string"){var authToken=specificToken} //specificToken chosen as authToken
      else{var authToken=randomChar(8)} //random token generation(by default)
      randList[authToken] ||= 1;
      
      authTokens[authToken]=createToken(authToken,filter,object,dispatch,coding) //authLevel
      return authToken
    }
    function endToken(authToken){ //authToken remover
      if(typeof authToken!=="string")
        throw new TypeError("The authToken MUST be a string ;-;");
      if(authToken.length<8)
        throw new RangeError("The authToken MUST be AT LEAST 8 characters long");
      try{
        authTokens[authToken].clients.forEach((_,a)=>a.close(1000))
        map.get( authTokens[authToken].object ).tokens.delete( authTokens[authToken] )
        delete randList[authToken]
        return delete authTokens[authToken]
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
    /*------------utility functions end------------*/
    
    /*------------event stuff begin------------*/
    var events={connect:[],disconnect:[],edit:[]} //more events will come in time
    function dispatch(type,token,socket){
      var defaultPrevented=false
      let preventDefault=()=>defaultPrevented=true
      var customEvent={token,socket,type,lock,unlock,preventDefault}
      customEvent.lock=lock.bind(customEvent)
      customEvent.unlock=unlock.bind(customEvent)
      let warn="an added listener produced the following error :/\n~"
      events[type].forEach(a=>{
        if(!defaultPrevented){
          try{a(customEvent)} catch(err){console.warn(warn,err)}
        }
      })
    }
    function addListener(event,yourReaction){
      if(typeof event!=="string"||typeof yourReaction!=="function"){
        throw new Error("The event parameter MUST be a STRING\nAND the yourReaction parameter MUST be a FUNCTION >:|")
      }
      if(!events[event]){throw new Error("That event DOES NOT EXIST :|")}
      events[event].push(yourReaction)
    }
    function endListener(event,yourReaction){
      if(typeof event!=="string"||typeof yourReaction!=="function"){
        throw new Error("The event parameter MUST be a STRING\nAND the yourReaction parameter MUST be a FUNCTION >:|")
      }
      if(!events[event]){throw new Error("That event DOES NOT EXIST :|")}
      let indexOfReaction=events[event].indexOf(yourReaction)
      if(indexOfReaction!=-1){events[event].splice(indexOfReaction,1)}
    }
    /*------------event stuff end------------*/
    
    /*------------websocket block begin------------*/
    ws.on('connection',(client)=>{
      let close=client.close.bind(client), ping=null, lastPing=Number(new Date()), alreadyClosed=false
      let clientMsgCount=0, token=null, dispatchClientEdit=(msg)=>map.get(token.object).sendEdit(msg,client)
      
      function closeClient(n=1000,now){ //to ensure socket cleanup
        if(alreadyClosed){return null} //don't repeat close if already closed
        alreadyClosed=true
        clearInterval(ping) //clearing this interval
        if(token){
          token.clients.delete(client)
          dispatch("disconnect",token,client)
        }
        if(now){return client.terminate()} //Connection Broken
        try{return close(n)}catch{return true}
      }
      client.close=closeClient //every socket.close that I call leads to this
      let afk=setTimeout(()=>{  closeClient(null,true)  },2000)
      
      client.on('message',async(msg)=>{
        //heartbeat handling start
        if(msg==="PING"&&clientMsgCount===1){
          //ping received with a socket that has SUCCESSFULLY CONNECTED
          //now I am sending own ping
          if(new Date()-lastPing<2500) return client.close(1000); //why are you pinging early? spammer?
          client.send("PING");
          return lastPing=Number(new Date())
        }
        //heartbeat handling end
        
        //client handshake start
        if(clientMsgCount===0){ //first message is handshake
          clearTimeout(afk) //first message means it is not inactive
          ping=setInterval(()=>{
            if(new Date()-lastPing>4000)  closeClient(null,true);
          },1000)
          let encodingHandled=false
          try{msg=JSON.parse(msg)}
          catch{return client.close(1000)}
          if(typeof msg==="object"){ //handle for if it has encoding
            try{var {decoder}=authTokens[msg[0]], parsed=JSON.parse(await decoder(msg[1]))}
            catch{return client.close(1002)}
            
            if(Date.now()-parsed[1]>1e3) return client.close(1002); //old encoding authentication
            if(parsed[0].length>64 || parsed[0].length<32) return client.close(1002);
            
            let key=msg[0]+parsed.join('')
            if(encodingStorage[key]) return client.close(1002); //reused authentication
            encodingStorage[key]=true
            setTimeout(_=>delete encodingStorage[key],1e3)
            encodingHandled=true
            msg=msg[0]
          }
          else if(!authTokens[msg])  return client.close(1000); //if you client doesn't have a valid token, they get closed
          
          if(authTokens[msg].decoder && !encodingHandled)  return client.close(1002); //this token uses encoding and it wasn't handled
          if(authTokens[msg].locked)  return client.close(1001); //if authToken is locked, no more new connections
          client.send("PING") //starts the back and forth pinging between server and client
          token=authTokens[msg]
          
          if(!token.encoder) client.send(objToString(token.object,true));
          else client.send( await token.encoder(objToString(token.object,true)) );
          client.token=token
          token.clients.set(client,1)
          dispatch("connect",token,client)
        }
        //client handshake end
        
        //object update handling start
        else if(token.filter!=1){ //listen to client if authLevel > 1 AND serial difference
          try{
            if(token.decoder) msg=await token.decoder(msg);
            stringToObj(msg,token.object,token.filter); //token.filter is authLevel
            msg=objToString(token.object);
            if(msg!==cmpStr) dispatchClientEdit(msg); //dispatch client edit if it did anything
          }
          catch(err){  console.log(err)  }
          //purposeful or not, unwanted data can be sent and read with error
        }
        //object update handling end
        
        clientMsgCount?0:clientMsgCount++ //I rather not count to infinity
      })
      //in any of the 3 below cases, it's time for this client to get closed
      client.on('disconnect',closeClient)
      client.on('close',(n)=>{
        if(!alreadyClosed) closeClient(n);
      })
      client.on('error',closeClient)
    })
    /*------------websocket block end------------*/
    
    let toReturn={authTokens,addToken,endToken,lock,unlock,addListener,endListener}
    Object.keys(toReturn).forEach(key=>{
      if(typeof toReturn[key]==="function"){toReturn[key]=toReturn[key].bind(toReturn)}
    })
    return toReturn //the function binding you would've seen is to maintain the functions' purpose(even after destructuring)
  }
  
  //connect to an object
  async function connect(location,authToken,onFail,obj,coding){ //receive an object(asynchronous to wait for connection with server)
    if(typeof location!=="string"||typeof authToken!=="string")
      throw new Error("BOTH location AND authToken MUST be STRINGS >:|");
    if(typeof onFail!=="function"&&onFail)
      throw new Error("If you choose the optional parameter onFail, it must be a function >:|");
    if(coding&&typeof coding==="object"?typeof coding.encoder!=="function"||typeof coding.decoder!=="function":false){
      throw new TypeError("If coding parameter is used, it MUST be an object with both 'encoder' and 'decoder' functions");
    }
    let toReturn=null, toReject=null, s=null, ping=null, alreadyClosed=false
    let server=await new webSocket(location)
    server.onerror=(err)=>{
      console.error("Attempting to connect to a websocket using the location parameter produced the following error :/\n~",err.message)
      if(onFail){onFail()} //if connecting fails, function is called(if given)
    }
    let p=new Promise((r,j)=> (toReturn=r, toReject=j) )
    function disconnectHandle(event,name){
      let code=event, disconnectReason=null
      if(isNaN(code))  code=event.code;
      if(code==1006)
        disconnectReason="closed ABNORMALLY: either you or the server just LOST connection :|";
      else if(code==1002)
        disconnectReason="authToken ENCODING FAULT: incorrect encoding/faulty protocol used, according to the server";
      else if(code==1001)
        disconnectReason="authToken LOCKED: this is a correct key, but it takes no new connections 0_0";
      else
        disconnectReason="closed PURPOSEFULLY: check your location and token parameters, OR you got BOOTED :/";
      
      let errorMessage=`connection with server is OVER due to event: ${name}\n${disconnectReason}`
      if(toReturn)  toReject(errorMessage);
      else  console.error(errorMessage);
      /*if the promise is NOT fulfiled, reject.. else, warn*/
      
      (clearInterval(s), clearInterval(ping));
      if(onFail)  onFail();
    }
    server.on('open',async()=>{
      server.send(JSON.stringify(!coding?authToken:[
        authToken,
        await coding.encoder( JSON.stringify([randomChar(32,""),Date.now()]) )
      ]))
      let firstMsg=false, lastPing=Number(new Date())
      ping=setInterval(()=>{
        if(new Date()-lastPing>4000){
          alreadyClosed=true //the close event gets called after so I want to prevent 2 events for 1 disconnection
          disconnectHandle(1006,"Connection Broken")
        }
      },1000)
      async function handleObj(){ //sends object data to server
        let toSend=objToString(obj);
        if(toSend!==cmpStr) //if there are edits
          server.send(coding?(await (coding.encoder(toSend))):toSend);
      }
      server.on('message',async(msg)=>{
        if(typeof msg==="object")  msg=msg.data; //this solves browser issues
        if(msg==="PING"){ //ping received(sending own ping)
          setTimeout(()=>server.send("PING"),2500)
          return lastPing=Number(new Date())
        }
        obj=stringToObj(coding?(await (coding.decoder(msg))):msg,obj);
        if(!firstMsg){
          objToString(obj)
          s=setInterval(handleObj,20)
          firstMsg=true
          toReturn(obj)
        }
      })
      server.on('disconnect',(ev)=>disconnectHandle(ev,'disconnect'))
      server.on('close',(ev)=>{
        if(!alreadyClosed)  disconnectHandle(ev,'close');
      })
      server.on('error',(ev)=>disconnectHandle(ev,'error'))
    })
    return await p
  }
  
  async function durableRead(filePath){
    try{return await fs.promises.readFile(filePath+'.json')}
    catch{return await fs.promises.readFile(filePath+'.tmp')}
  }
  async function durableWrite(filePath,data){
    await fs.promises.writeFile(filePath+'.tmp',data)
    await fs.promises.writeFile(filePath+'.json',data)
    await fs.promises.unlink(filePath+'.tmp')
  }
  const inconsistencyMap=new Map()
  function consistencyUnsafe(object){
    return inconsistencyMap.get(object)
  }
  function setConsistency(object,isConsistent){
    if(isConsistent) inconsistencyMap.delete(object);
    else inconsistencyMap.set(object,true);
  }
  const syncList=new Map() //sync list for records of syncing
  //sync object to filePath
  async function sync(filePath,obj,coding){
    var errors=[], yesOrNo={true:"errors",false:"error"}
    if(typeof filePath!=="string")
      errors.push("filePath MUST be a STRING >:{");
    if(obj&&typeof obj!=="object")
      errors.push("obj (if used) MUST be an OBJECT >:|");
    if(coding&&typeof coding==="object"?typeof coding.encoder!=="function"||typeof coding.decoder!=="function":false)
      errors.push("If coding parameter is used, it MUST be an object with both 'encoder' and 'decoder' functions");
    if(errors.length){
      throw new Error(`A total of ${errors.length} ${yesOrNo[errors.length>1]} generated ;-;\n${errors.join("\n")}`);
    }
    
    const syncToken=syncList.get(filePath)
    if(syncToken){
      syncToken.count++;
      return syncToken.object;
    }
    let encode=data=>coding?coding.encoder(data):data, decode=data=>coding?coding.decoder(data):data;
    
    try{  var object=stringToObj(await decode(await durableRead(filePath)),obj)  }
    catch{  var object=obj&&typeof obj==="object"?obj:{}  }
    
    try{  await durableWrite(filePath,await encode(objToString(object,true)))  }
    catch(err){  throw new Error("Using this filePath caused an error ;-;\n~",err)  }
    
    
    async function dispatch(){
      if(consistencyUnsafe(object)) return false;
      while(token.saving) await new Promise(r=>setTimeout(r,10));
      token.saving=true
      await durableWrite(filePath,await encode(objToString(object,true)))
      token.saving=false
    }
    const token={authToken:"sync",clients:new Map(),count:1,dispatch,object,saving:false}
    addMapping(token)
    
    syncList.set(filePath,token);
    return object
  }
  
  //desyc object from filePath
  function desync(filePath){
    if(typeof filePath!=="string")
      throw new TypeError("filePath MUST be a STRING");
    let token=syncList.get(filePath);
    if(!token) throw new Error("NON-EXISTING filePath *-*");
    if(--token.count<1){
      syncList.delete(filePath);
      map.get(token.object).tokens.delete(token);
    }
  }
  
  
  global.webject||={serve, connect, sync, desync, objToString, stringToObj, partFilter, objValueFrom, setConsistency};
  module.exports=global.webject;
  
  
  })()
  
