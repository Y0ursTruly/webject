let {spawn}=require('child_process')
let log=(text)=>console.log('\x1b[1m\x1b[33m'+text+'\x1b[0m')
async function exec(command){
  return await new Promise(resolve=>{
    let options={stdio: 'inherit',env:process.env,cwd:undefined,shell:true}
    let myChild=spawn(command,['build'],options)
    myChild.on('close',resolve)
  })
}

async function example(toLog,exampleName){
  let slash=process.platform=="win32"?"\\":"/"; log('\n'+toLog)
  return await exec(`node "${__dirname+slash+exampleName}.js"`)
};

(async()=>{
  await example("Sharing Object Test(first test)", "clientAndServer")
  await example("Delete Test(even if cyclic deleted)", "deleteExample")
  await example("Function Skip Test(functions not shared)", "functionSkipped")
  await example("Multiple Objects Testing(one per authToken)", "multipleObjects")
  await example("Lock Testing(an authToken can be locked)", "lockTesting")
  await example("Events Testing(demonstration of events)", "eventsTesting")
  await example("No Re-Pointing Test(nested objects are instead modified)", "noRePointing")
})()
