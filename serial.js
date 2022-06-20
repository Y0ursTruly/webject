(()=>{



//every index in an objToString used to be {path,value,reference,delete}
//now it's [[indicator,...path],otherArgument]
//for otherArgument: 0 means delete(no otherArgument), 1 means reference, no indicator means value
const WINDOW=typeof window==="undefined"?global:window
const {Object,JSON,WeakMap,ReferenceError,TypeError,RangeError}=WINDOW
const {keys,getOwnPropertyDescriptor:describe}=Object
const {stringify:str,parse}=JSON

//an entire class for determining if a path will be deleted due to any of its parents to be deleted
//eg: a.b will be deleted so no need to say delete a.b.c
class deleteStorage{
  constructor(){
    this.storage={__proto__:null} //stores paths that will be deleted
  }
  has(map){
    var x=this.storage, count=0
    for(let i=0;i<map.length;i++){
      if(typeof map[i]==="number"){continue}
      const c=x[map[i]]
      if(c){count++; x=c}
    }
    return count
  }
  put(map){
    var x=this.storage
    for(let i=0;i<map.length;i++){
      if(typeof map[i]==="number"){continue}
      const a=map[i], {storage}=this
      storage[a]?0:storage[a]={}
      x=storage[a]
    }
  }
}

//see if an enumerable property(of key) exists(in obj)
function includes(obj,key){
  let existing=describe(obj,key)
  return existing?existing.enumerable:false
}

//this function takes a path and an object and returns the value based on that path
function mapToFile(map,files){
  var x=files //pointer for recursion
  if(!map||!map.length){return(files)} //the return value IS the object
  map.forEach(a=>{
    if(typeof a==="number"){return null} //key not a part of actual path
    if(includes(x,a)){x=x[a]} //recursion using the path(map)
    else{throw new ReferenceError("The given path(map) does not point to any nested value in the given object(files)")}
  })
  return x
}
let listFn=cache=>{
  let toReturn=part=>{
    part.path=str(part[0])
    cache[part.path]=part
  }
  return toReturn
}


function objToString(obj,cmpStr,spacing,checkClone){ //concept from object cloner
  //moved cmpStr to the second argument because I'm almost never gonna be using spacing and checkClone
  
  //put a truthy value for checkClone and it returns {clone,string}
  if(typeof obj!="object"){const x=obj; return x}
  function casingOf(obj){if(obj instanceof Array){return[]}return{}}
  var newObj=casingOf(obj); var arr2=[[[],casingOf(obj)]]
  var arr=new WeakMap([[obj,0]]), length=1, arr1=[[]], newObj1=newObj
  
  function recurse(obj,newObj,map){
    keys(obj).forEach((a,i)=>{
      if(typeof obj[a]==="function"){return null} //skip keys that have their values as function
      const map1=[...map]; map.push(a)
      if(typeof obj[a]=="object"&&obj[a]!=null){
        newObj[a]=casingOf(obj[a])
        var casing=casingOf(obj[a])
        if(arr.get(obj[a])===undefined){
          arr2.push([[...map],casing])
          arr.set(obj[a],length++); arr1.push(map)
          recurse(obj[a],newObj[a],[...map])
        }
        else{
          var myIndex=arr.get(obj[a])
          arr2.push([[1,...map],myIndex])
          arr.set({},length++); arr1.push(map) //so that index reference works
          newObj[a]=mapToFile(arr1[myIndex],newObj1)
        }
        return map=map1
      }
      arr2.push([[...map],obj[a]])
      arr.set({},length++); arr1.push(map) //so that index reference works
      newObj[a]=obj[a]; map=map1
    })
  }
  
  recurse(obj,newObj,[]); var result=str(arr2,null,spacing||'')
  if(checkClone&&!cmpStr){return{clone:newObj,string:result}}
  if(!cmpStr){return result}
  
  var finalResult=[], cache1={}, cache2={} //2 is old version, 1 is new version
  let list1=parse(result), list2=parse(cmpStr)
  list1.forEach(listFn(cache1)), list2.forEach(listFn(cache2))
  const deleteList=new deleteStorage()
  keys(cache2).forEach(key=>{if(!cache1[key]){ //delete indication
    if(deleteList.has(cache2[key][0])){return null} //if parent will be deleted, child will be too
    deleteList.put(cache2[key][0])
    if(cache2[key][0][0]!==0){
      if(typeof cache2[key][0]==="number"){cache2[key][0][0]=0}
      else{cache2[key][0].unshift(0)}
    }
    cache2[key].length=1; finalResult.push(cache2[key])
  }})
  keys(cache1).forEach(key=>{
    if(!cache2[key]){ finalResult.push(cache1[key]) }
    else if(str(cache2[key])!=str(cache1[key])){ finalResult.push(cache1[key]) }
  })
  
  finalResult.forEach(part=>{ delete(part.path) })
  if(checkClone){return{clone:newObj,string:str(finalResult)}}
  return str(finalResult)
}


function stringToObj(string,obj,onlyDifference){
  if(typeof obj!="object"){obj={}}
  var info=parse(string.toString()), arr=[obj]
  info.forEach(item=>{
    const type=typeof item[0][0]==="number"?item[0][0]:2
    //type: 0(delete), 1(reference), 2(value)
    let error="Invalid data provided from whatever the stringToObj received"
    
    let parentMap=item[0].slice(0,item[0].length-1)
    let parent=mapToFile(parentMap,obj)
    let child=item[0][item[0].length-1]
    //if the above 3 variables are thrown errors, the function received erroneous data
    if(type===0){
      if(!onlyDifference){
        throw new TypeError("Deleting is not permitted since onlyDifference is false; "+error)
      }
      delete parent[child]
    }
    else if(type===1){parent[child]=info[ item[1] ][1]}
    else if(type===2){parent[child]=item[1]}
    else{throw new RangeError(error)}
  })
  return obj
}


try{module.exports={objToString,stringToObj}}
catch(err){
  window.objToString=objToString
  window.stringToObj=stringToObj
  console.log("Part 2/2 loaded, LET'S GO >:D")
}



})()
