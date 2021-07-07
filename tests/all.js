// Utils

function spawn_command_async(command,args){
  return child_process.spawn(command,args,{shell: true});
}

function wait(ms = 1000){
  return new Promise((resolve,reject) => setTimeout(resolve,ms));
}

function launchMongo(){
  return spawn_command_async("mongo",["--dbpath",process.cwd,"--logpath","/tmp/mongod.log"]);
}


// Main

(async function(){
  let mongoProc = launchMongo();
  
  await wait(9999); // testing test
  
  mongoProc.kill("SIGTERM");
})();
