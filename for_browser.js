(()=>{



  //every index in an objToString used to be {path,value,reference,delete}
  //now it's [[indicator,...path],otherArgument]
  //for otherArgument: 0 means delete(no otherArgument), 1 means reference, no indicator means value
  const {Object,JSON,WeakMap,ReferenceError,TypeError,RangeError}=window
  const {keys,getOwnPropertyDescriptor:describe}=Object
  const {stringify:str,parse}=JSON, CACHE=new WeakMap()
  
  
  
  //see if an enumerable property(of key) exists(in obj)
  function includes(obj,key){
    if( (obj instanceof Array) && (key==="length") ) return true;
    let existing=describe(obj,key)
    return existing?existing.enumerable:false
  }
  //see if 2 objects are the "same"(to determine if to overwrite or not)
  function same(obj1,obj2){
    if(obj1===obj2) return true;
    if(typeof obj1==="symbol"&&typeof obj2==="symbol")
      return obj1.description===obj2.description;
    let condition1=typeof(obj1)===typeof(obj2)
    let condition2=(obj1 instanceof Array)===(obj2 instanceof Array)
    let condition3=(obj1?obj1[Symbol.toStringTag]:null) === (obj2?obj2[Symbol.toStringTag]:null)
    let conditionAll=condition1&&condition2&&condition3&&typeof obj1==="object"
    if(conditionAll && obj1[Symbol.toStringTag]?.includes('Array'))
      return obj1.length===obj2.length;
    return conditionAll
  }
  //this function takes a path and an object and returns the value based on that path
  function valueFrom(path,object,n=0){
    if(!path||!path.length) return object;
    var curr=object, i=0
    for(i=0;i<path.length-n;i++){
      let key=path[i]
      if(includes(curr,key)) curr=curr[key];
      else throw new ReferenceError(
        "The given list does not point to any nested value in the given pointer"
      );
    }
    return curr
  }
  const nonjson={
    __proto__:null,
    undefined: function(data){return undefined},
    Uint8Array: function(data){return new Uint8Array(data)},
    Uint8ClampedArray: function(data){return new Uint8ClampedArray(data)},
    Uint16Array: function(data){return new Uint16Array(data)},
    Uint32Array: function(data){return new Uint32Array(data)},
    BigUint64Array: function(data){return new BigUint64Array(data.split(','))},
    Int8Array: function(data){return new Int8Array(data)},
    Int16Array: function(data){return new Int16Array(data)},
    Int32Array: function(data){return new Int32Array(data)},
    Int64Array: function(data){return new Int64Array(data)},
    BigInt64Array: function(data){return new BigInt64Array(data.split(','))},
    BigInt: function(data){return BigInt(data)},
    Symbol: function(data){return Symbol(data)}
  }
  //this function is a faster version of [...array]
  function spread(array){
    //here's a funny story: [...array] is slow but [someValue,...array] is fast NO CAP
    const toReturn=Array(array.length)
    for(let i=0;i<array.length;i++) toReturn[i]=array[i];
    return toReturn
  }
  function casingOf(item,forClone){
    if(item===undefined || item===null) return forClone? item: null;
    let tag=item[Symbol.toStringTag];
    if(tag){
      if(tag==="Symbol")
        return forClone? Symbol(item.description): item.description;
      if(tag==="BigInt")
        return forClone? item: item.toString();
      if(tag.includes("Big"))
        return forClone? nonjson[tag](spread(item).join(',')): spread(item).join(','); //bigint typed arrays
      return forClone? nonjson[tag](spread(item)): spread(item); //for all other typed arrays
    }
    if(typeof item!=="object") return item; //numbers, strings
    //also functions but these get ignored either way
    let shell=item instanceof Array? ([]): ({}),  keys=Object.keys(item);
    for(let i=0;i<keys.length;i++){
      let ITEM=item[keys[i]]
      if(typeof ITEM==="bigint" || ITEM===undefined) continue;
      if(!ITEM || (!ITEM[Symbol.toStringTag] && typeof ITEM!=="object"))
        shell[keys[i]] = ITEM;
    }
    return shell
  }
  /* 
    the value in ONE index(part) of an objToString array are 1 of the following types:
    
    [path,data] //value
    [path,refPath,num] //reference
    [path] //delete
    
    - path is array of strings to represent a location
    - data is an instance of a datatype to represent a value
    - refPath is an index to a referred path located in another index(part) or the path array itself
    - num is a number which can be 3 options: 0=not mentioned, 1=mentioned as path, 2=mentioned as reference
  */
  function recurse(obj,clone,map,list,PATH,level,RECURSED,isTop){
    if(level>128) throw new RangeError("Given object goes too many levels inward (>128)");
    let KEYS=keys(obj), KEYS1=keys(clone), data=map.get(obj)
    if(isTop) RECURSED.set(obj,true);
    if(obj instanceof Array){
      KEYS.push("length"); KEYS1.push("length")
    }
    for(let i=0;i<KEYS1.length;i++){
      if(!includes( obj,KEYS1[i] )){
        delete clone[KEYS1[i]]
        list.push([ [...PATH,KEYS1[i]] ]) //delete
      }
    }
    for(let i=0;i<KEYS.length;i++){
      let key=KEYS[i], item=obj[key]
      if(includes(clone,key)&&item===clone[key]) continue;
      let Path=[...PATH,key], path=data[1]&&PATH.length>=2? [data[1],key]: Path;
      
      let notSame=!same( obj[key],clone[key] ), temp=map.get(item)
      //structure of temp: [path, index, num, clone]
      //temp is the value of a map's key, item
      
      let newEntry=!includes( clone,key ) || notSame;
      if(!newEntry&&temp) temp[2]=0;
      if(newEntry){
        if(notSame||item===undefined) clone[key]=temp?temp[3]:casingOf(item,true);
        if(temp){
          let [refPath,refIndex,mentioned]=temp
          if(mentioned) refPath=refIndex;
          else (temp[2]=2, temp[1]=list.length); //length+i
          list.push([ path,refPath,mentioned ]) //refer
        }
        else{
          if(item===null || item===undefined?false:!item[Symbol.toStringTag])
            list.push([ path,casingOf(item) ]); //write
          else{
            if(item && typeof item!=="bigint") RECURSED.set(item,true);
            let datatype=(item||typeof item==="bigint")? item[Symbol.toStringTag]: "undefined";
            list.push([ path,casingOf(item),0,datatype ]); //write(for nonjson data types)
          }
        }
      }
      if(typeof item==="symbol" || (typeof item==="object" && item!==null)){
        if(!temp)
          map.set(item,[Path,list.length-1,newEntry?1:0,clone[key],false]);
        if(!RECURSED.get(item)){
          RECURSED.set(item,true);
          recurse(obj[key],clone[key],map,list,Path,level+1,RECURSED);
        }
      }
    }
  }
  
  
  
  
  function objToString(obj,noCache){
    if(Array.isArray(obj) || typeof obj!=="object")
      throw new TypeError("root element of data MUST be an OBJECT");
    if(noCache)
      var clone=casingOf(obj,true);
    else
      var {clone,map}=CACHE.get(obj)||{};
    
    const list=[ [[],!map?casingOf(obj):{}] ], path=[]
    const tag=obj?obj[Symbol.toStringTag]||null:null
    if(nonjson[tag]) list[0].push(0,tag);
    
    if(!map){
      var clone=casingOf(obj,true), map=new WeakMap()
      CACHE.set(obj,{clone,map})
    }
    map.set(obj,[path,0,1,clone]) //see temp description in recurse function above
    recurse(obj,clone,map,list,path,1,new WeakMap(),true)
    return str(list)
  }
  
  const constraints={ //default constraints
    __proto__:null,
    1: function(/*part,obj,info*/){ return false }, //no edits allowed
    2: function(part,obj){ //only addition(no deletion or modification)
      if(part.length!==2 && part.length!==4) return false; //no deleting or re-referencing
      try{return valueFrom(part[0],obj),false} //returns false(no overwriting)
      catch{return true}
    },
    3: function(/*part,obj,info*/){ return true } //all edits allowed
  }
  //when dealing with large buffers, toString and String.fromCharCode ends up throwing maximum stack size exceeded (last time I checked)
  //so, I have my own "toString" function to convert a buffer to string
  let ab_map=[]
  for(let i=0;i<256;i++)
    ab_map[i]=String.fromCharCode(i);
  function ab2str(buf) {
    let arr=new Uint8Array(buf), chars="";
    for(let i=0;i<arr.length;i++) chars+=ab_map[arr[i]];
    return chars;
  }
  function stringToObj(string,obj,constraint=3){
    if(constraint===1||constraint==='1') return obj; //let's not waste time processing if it will deny all
    let allowed=typeof constraint==="function"?constraint:constraints[constraint];
    
    var info=parse(typeof string==="string"?string:ab2str(string));
    if(typeof obj!=="object"){
      if(info[0].length===2) obj=casingOf(info[0][1]);
      else obj=nonjson[info[0][3]](info[0][1]);
    }
    else info[0][1]=obj;
    
    for(let i=1;i<info.length;i++){
      let part=info[i], [n,c]=part[0]
      if(typeof n==="number") part[0]=[...info[n][0],c];
      if(constraint!==3 && !allowed(part,obj,info)) continue; //filters
      let [path,data,num]=part, last=path.at(-1)
      if(part.length===1){ //delete
        delete valueFrom( path,obj,1 )[last]
      }
      else if(part.length===2){ //write
        let parent=valueFrom( path,obj,1 )
        if(!same( parent[last],part[1] )) parent[last]=part[1];
      }
      else if(part.length===3){ //refer
        if(num>0) valueFrom(path,obj,1)[last] = valueFrom(info[data][num-1],obj);
        else valueFrom(path,obj,1)[last] = valueFrom(data,obj);
      }
      else{ //write a non-json datatype (length is 4)
        let parent=valueFrom( path,obj,1 )
        if(!same( parent[last],part[1] )) parent[last]=nonjson[part[3]](part[1]);
      }
    }
    return obj
  }
  
  window.objToString=objToString
  window.stringToObj=stringToObj
  window.objValueFrom=valueFrom
  
  
  
  })();
  (()=>{
  
  
  
  var webSocket=WebSocket, cmpStr=objToString({});
  webSocket.prototype.on=webSocket.prototype.addEventListener
  
  
  let randList={__proto__:null} //this block here is for recording random UNIQUE keys
  let random =_=> crypto.getRandomValues(new Uint32Array(1))[0];
  let range =(max,min)=> (random()%(max-min))+min; //numeric range
  var arr='abcdefgjiklmnopqrstuvwxyz-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ :;.,\\/"\'?!(){}[]@<>=+*#$&`|~^%'.split('')
  function randomChar(n,defaultChar){
    if(typeof defaultChar!=="string") defaultChar="webject_"; //all default authTokens begin with webject_
    do{
      var str="", length=range(2*n,n)
      for(let i=0;i<length;i++) str+=arr[range(arr.length-1,0)];
      str=defaultChar+str;
    }while(randList[str]);
    randList[str]=true //so that this key won't repeat
    return str;
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
  
  
  window.connect=connect
  
  
  })()
  