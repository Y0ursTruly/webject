(()=>{



function mapToFile(m,files){var x=files
  if(!m||!m.length){return(files)}var errort=0
  m.forEach(a=>{if(x[a]){x=x[a]}else{errort=1}})
  if(errort){return(0)}return(x)
}
let listFn=cache=>{
  let toReturn=part=>{
    part.path=JSON.stringify(part.path)
    cache[part.path]=part
  }
  return toReturn
}

function objToString(obj,spacing,checkClone,cmpStr){ //concept from object cloner
  //put a truthy value for checkClone and it returns {clone,string}
  if(typeof obj!="object"){const x=obj; return x}
  function casingOf(obj){if(obj instanceof Array){return[]}return{}}
  var newObj=casingOf(obj); var arr2=[{path:[],value:casingOf(obj)}]
  var arr=[obj]; var arr1=[[]]; var newObj1=newObj
  
  function recurse(obj,newObj,map){
    Object.keys(obj).forEach((a,i)=>{
      if(typeof obj[a]=="function"){return;} //skip keys that have their values as function
      const map1=[...map]; map.push(a)
      if(typeof obj[a]=="object"&&obj[a]!=null){
        newObj[a]=casingOf(obj[a])
        var casing=casingOf(obj[a])
        if(!arr.includes(obj[a])){
          arr2.push({path:[...map],value:casing})
          arr.push(obj[a]); arr1.push(map)
          recurse(obj[a],newObj[a],[...map])
        }
        else{
          var myIndex=arr.indexOf(obj[a])
          arr2.push({path:[...map],reference:myIndex})
          arr.push(obj[a]); arr1.push(map) //so that index reference works
          newObj[a]=mapToFile(arr1[myIndex],newObj1)
        }
        return map=map1;
      }
      arr2.push({path:[...map],value:obj[a]})
      arr.push(obj); arr1.push(map) //so that index reference works
      newObj[a]=obj[a]; map=map1
    })
  }
  recurse(obj,newObj,[]); var result=JSON.stringify(arr2,null,spacing||'')
  if(checkClone&&!cmpStr){return{clone:newObj,string:result}}
  if(!cmpStr){return result}
  var finalResult=[], cache1={}, cache2={} //2 is old version, 1 is new version
  let list1=JSON.parse(result), list2=JSON.parse(cmpStr)
  list1.forEach(listFn(cache1)), list2.forEach(listFn(cache2))
  Object.keys(cache2).forEach(key=>{if(!cache1[key]){
    cache2[key].delete=true; finalResult.push(cache2[key])
  }})
  Object.keys(cache1).forEach(key=>{ let {stringify:str}=JSON
    if(!cache2[key]){ finalResult.push(cache1[key]) }
    else if(str(cache2[key])!=str(cache1[key])){ finalResult.push(cache1[key]) }
  })
  finalResult.forEach(part=>{ part.path=JSON.parse(part.path) })
  if(checkClone){return{clone:newObj,string:JSON.stringify(finalResult)}}
  return JSON.stringify(finalResult)
}


function stringToObj(string,obj,onlyDifference){
  if(typeof obj!="object"){obj={}}
  var info=JSON.parse(string); let arr=[obj]
  info.forEach(a=>{
    let x=obj; let index=a.path.length-1
    if(a.path.length==0){return obj.__proto__=a.value.__proto__}
    a.path.slice(0,index).forEach(a=>x=x[a])
    if(a.delete){delete(x[a.path[index]])} //onlyDifference has to give delete indications like this
    else if(Object.keys(a).includes("value")){
      if(typeof x[a.path[index]]=="object"&&typeof a.value=="object"){
        x[a.path[index]].__proto__=a.value.__proto__; a.value=x[a.path[index]]
      }
      else{x[a.path[index]]=a.value} arr.push(a.value)
    }
    else{x[a.path[index]]=arr[a.reference];arr.push(arr[a.reference])}
  })
  if(onlyDifference){return obj} //only the difference was given and NOT the full object
  //this part(the next 3 lines) for deleting ONLY the removed keys(instead of deleting everything and rewriting)
  JSON.parse(objToString(obj))
  .filter(a=>info.every(b=>JSON.stringify(b.path)!=JSON.stringify(a.path))) 
  .forEach(a=>delete(mapToFile(a.path.slice(0,a.path.length-1),obj)[a.path[a.path.length-1]]))
  //that line above is an eyefull, but the mapToFile returns the parent and the [] part is the name of the child
  //that combination was made because cyclics proved more difficult to delete
  return obj
}


try{module.exports={objToString,stringToObj}}
catch(err){
  window.objToString=objToString
  window.stringToObj=stringToObj
  console.log("Part 2/2 loaded, LET'S GO >:D")
}



})()
