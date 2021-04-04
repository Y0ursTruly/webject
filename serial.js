function objToString(obj,checkClone){ //concept from object cloner
  //put a truthy value for checkClone and it returns {clone,string}
  if(typeof obj!="object"||obj==null){const x=obj; return x}
  
  function mapToFile(m,files){var x=files
    if(!m||!m.length){return(files)}var errort=0
    m.forEach(a=>{if(x[a]){x=x[a]}else{errort=1}})
    if(errort){return(0)}return(x)
  }
  
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
  recurse(obj,newObj,[]); var result=JSON.stringify(arr2)
  if(checkClone){return{clone:newObj,string:result}}return result
}
function stringToObj(string,obj){
  if(typeof obj!="object"){obj={}}
  var info=JSON.parse(string); let arr=[obj]
  function mapToFile(m,files){var x=files
    if(!m||!m.length){return(files)}var errort=0
    m.forEach(a=>{if(x[a]){x=x[a]}else{errort=1}})
    if(errort){return(0)}return(x)
  }
  info.forEach(a=>{
    let x=obj; let index=a.path.length-1
    if(a.path.length==0){return obj.__proto__=a.value.__proto__}
    a.path.slice(0,index).forEach(a=>x=x[a])
    if(Object.keys(a).includes("value")){x[a.path[index]]=a.value;arr.push(a.value)}
    else{x[a.path[index]]=arr[a.reference];arr.push(arr[a.reference])}
  })
  //this part(the next 3 lines) for deleting ONLY the removed keys(instead of deleting everything and rewriting)
  JSON.parse(objToString(obj))
  .filter(a=>info.every(b=>JSON.stringify(b.path)!=JSON.stringify(a.path))) 
  .forEach(a=>delete(mapToFile(a.path.slice(0,a.path.length-1),obj)[a.path[a.path.length-1]]))
  //that line above is an eyefull, but the mapToFile returns the parent and the [] part is the name of the child
  //that combination was made because cyclics proved more difficult to delete
  return obj
}

try{module.exports={objToString,stringToObj}}
catch(err){console.log("BTW, you must be a browser :D")}
