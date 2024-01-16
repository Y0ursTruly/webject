const test=require('node:test'), assert=require('node:assert'), fs=require('node:fs');
const {serve, connect, sync, desync, objToString, stringToObj, objValueFrom}=require('.');

(async function(){
  let slash=process.platform=="win32"?"\\":"/", serverLocation="ws://localhost:8009"
  let log=(text)=>console.log('\x1b[1m\x1b[33m'+text+'\x1b[0m')
  const mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:new Uint8Array([3,4]),undefined};
  mainObj.m=mainObj;
  const mainObj2={n:1,i:true,o:false,p:true};
  const myWebject=serve(mainObj)
  let lvl3Key=myWebject.addToken(3)
  let lvl2Key=myWebject.addToken(2)
  let viewKey=myWebject.addToken(1), viewKey2=myWebject.addToken(1,mainObj2)
  let manualToken=myWebject.addToken(1,mainObj2,"manual_token")

  const sharedObj=await connect(serverLocation,viewKey)
  const sharedObj1=await connect(serverLocation,viewKey)
  const sharedObj2=await connect(serverLocation,viewKey2)
  async function sharedObjectsEqual(){
    await new Promise(ok=>setTimeout(ok,50)) //by now change should be implemented
    for(let i=0;i<arguments.length;i++)
      assert.deepStrictEqual(mainObj,arguments[i]);
  }

  //first set of tests
  await test("1) Ensuring Objects Shared",async function(t){
    await t.test("After initial 'connect'",async function(){
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("On modification",async function(){
      mainObj.c[0]++;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("On deletion",async function(){
      delete mainObj.m;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("On insertion",async function(){
      mainObj.m=mainObj;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("Do functions get ignored?",async function(){
      mainObj.fn=function(){return 'boilerplate'}
      await new Promise(ok=>setTimeout(ok,50)) //by now change should be implemented
      assert.strictEqual(Object.getOwnPropertyDescriptor(sharedObj,'fn'),undefined) //key was not shared
      delete mainObj.fn
    })
  })

  //second set of tests
  await test("2) Serialisation Based Checks",async function(t){
    await t.test("Conversion between objToString and stringToObj",async function(){
      assert.deepStrictEqual(stringToObj(objToString(mainObj,true)),mainObj)
    })
    await t.test("Usage of objValueFrom",async function(){
      assert.strictEqual(objValueFrom(['c','0'],mainObj),mainObj.c[0])
      assert.strictEqual(objValueFrom(['a','a2','a3'],mainObj),mainObj.a.a2.a3)
    })
  })

  //third set of tests
  await test("3) Verification of 'webject' Methods",async function(t){
    var count=0
    function lockListener({lock}){ //destructuring example(function still works)
      //this function is used in addListener
      count+=5
      lock() //the token used to connect with was locked
    }
    await t.test("Manual authToken connection",async function(){
      let resolve=null, temp=new Promise(r=>resolve=r), resolver=ev=>resolve(ev.token.authToken);
      myWebject.addListener("connect",resolver)
      assert.deepStrictEqual(await connect(serverLocation,manualToken),sharedObj2)
      assert.strictEqual(await temp,manualToken)
      myWebject.endListener("connect",resolver)
    })
    await t.test("Locking and unlocking",async function(){
      myWebject.addListener("connect",lockListener)
      assert.deepStrictEqual(await connect(serverLocation,manualToken),sharedObj2)
      try{
        await connect(serverLocation,manualToken)
        throw new Error("Connection did not throw; locking failed")
      }
      catch(err){
        assert.strictEqual(
          (err.message||err).split('\n').at(-1),
          "authToken LOCKED: this is a correct key, but it takes no new connections 0_0"
        )
        //"magic string" source: webject.js line 317
      }
    })
    await t.test("Proof of endListener",async function(){
      let currentCount=count
      myWebject.endListener("connect",lockListener) //count changes every connection
      assert.deepStrictEqual(await connect(serverLocation,viewKey),mainObj) //but it won't change
      assert.deepStrictEqual(await connect(serverLocation,viewKey),mainObj) //didn't throw locked error
      assert.strictEqual(currentCount,count) //no change since listener was already ended
    })
    await t.test("Ensuring endToken works",async function(){
      myWebject.endToken(manualToken)
      try{
        await connect(serverLocation,manualToken)
        throw new Error("Connection did not throw; endToken failed")
      }
      catch(err){
        assert.strictEqual(
          (err.message||err).split('\n').at(-1),
          "closed PURPOSEFULLY: check your location and token parameters, OR you got BOOTED :/"
        )
        //"magic string" source: webject.js line 319
      }
    })
    await t.test("Ensuring ping logic doesn't disconnect you",async function(){
      await new Promise(r=>setTimeout(r,5001))
      mainObj.newkeyy=3;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("authLevel 2 and 3 tokens",async function(){
      let temp2=await connect(serverLocation,lvl2Key) //can only insert new items
      let temp3=await connect(serverLocation,lvl3Key) //can delete, modify, insert new items
      delete temp3.newkeyy;
      await sharedObjectsEqual(sharedObj,sharedObj1,temp3)
      temp2.newkeyy=4;
      await sharedObjectsEqual(sharedObj,sharedObj1,temp2)
      temp2.newkeyy++;
      await sharedObjectsEqual(sharedObj,sharedObj1)
      assert.notDeepStrictEqual(mainObj,temp2) //since lvl2 shouldn't be able to modify
      delete temp2.newkeyy;
      await sharedObjectsEqual(sharedObj,sharedObj1)
      assert.notDeepStrictEqual(mainObj,temp2) //since lvl2 shouldn't be able to delete
    })
    //the issue is that everyone gets the edit
    await t.test("Edit and disconnect handling",async function(){
      let resolve=null, temp=new Promise(r=>resolve=r)
      function resolver({token}){resolve(token.authToken)}
      function editHandler({socket,token}){
        if(token.authToken===viewKey){
          assert.ok(!token.clients.get(socket)) //socket was NOT from a viewKey token
          assert.strictEqual(socket.token.authToken,lvl3Key) //it was in fact from lvl3Key token
          //the socket argument is from WHO EDITED, if null, edit originated on server side
          socket?.close(1000); //temp3 closed
        }
        assert.strictEqual(token.object,mainObj) //every edit event is with a token that has mainObj
      }
      myWebject.addListener("edit",editHandler)
      myWebject.addListener("disconnect",resolver)
      let temp3=await connect(serverLocation,lvl3Key) //can delete, modify, insert new items
      temp3.newKey=2 //an edit
      assert.strictEqual(await temp,lvl3Key)
      temp3.newKey++ //second edit where temp3 is already disconnected
      await sharedObjectsEqual(sharedObj,sharedObj1)
      assert.notDeepStrictEqual(temp3,mainObj)
      myWebject.endListener("edit",editHandler)
      myWebject.endListener("disconnect",resolver)
    })
  })

  //fourth set of tests
  await test("4) Verification of 'connect' handling of 'onFail'",async function(t){
    let mySharedObj={}, count=5, resolve=null, p=new Promise(r=>resolve=r);
    function rejector(ev){
      log('connection made.. disconnecting...\n')
      setTimeout(()=>ev.socket.close(),10)
    }
    myWebject.addListener("connect",rejector)
    async function loop(){
      if(--count<1) resolve(); //stop execution
      await new Promise(r=>setTimeout(r,300)) //so it doesn't try to re-connect instantly
      await connect(serverLocation,lvl3Key,loop,mySharedObj)
      //remember that the default port it tries to put the websocket on is 8009 when you don't give it a server
    }
    loop()
    await p
    assert.deepStrictEqual(mySharedObj,mainObj)
    myWebject.endListener("connect",rejector)
  })

  //fifth set of tests
  await test("5) Usage of 'sync' and 'desync' Functions",async function(t){
    const filePath=__dirname+slash+"record.json"
    sync(filePath,mainObj)
    for(let i=0;i<5;i++){
      mainObj.c[0]++;
      await new Promise(r=>setTimeout(r,50))
      assert.deepStrictEqual(stringToObj(fs.readFileSync(filePath)), mainObj) //file updated
    }
    desync(filePath)
    mainObj.c[0]++;
    await new Promise(r=>setTimeout(r,50))
    assert.notDeepStrictEqual(stringToObj(fs.readFileSync(filePath)), mainObj) //file not updated
    fs.unlinkSync(filePath)
  })

  //sixth set of tests
  await test("6) Usage of Encoding {encoder,decoder}",async function(t){
    //these following functions r async just to make sure the encoding functions are awaited on
    async function encoder(data){
      let result=Buffer.from(data,'binary').toString('base64')
      return result
    }
    async function decoder(data){
      let result=Buffer.from(data,'base64').toString()
      return result
    }
    const filePath=__dirname+slash+"record.json"
    const encodingKey=myWebject.addToken(1,0,0,{encoder,decoder})
    //the 0s for falsish values to invoke their default values instead
    const mySharedObj=await connect(serverLocation,encodingKey,0,0,{encoder,decoder})
    sync(filePath,mySharedObj,{encoder,decoder})
    await new Promise(r=>setTimeout(r,50))
    assert.strictEqual(await encoder(objToString(mainObj,true)),fs.readFileSync(filePath).toString())
    fs.unlinkSync(filePath)
  })

  setTimeout(_=>process.exit(0),50)
})()
