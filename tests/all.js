// Utils
const child_process = require("child_process");

function spawn_command_async(command,args){
  console.log("Executing",command + " " + args.join(" "));
  return child_process.spawn(command,args,{shell: true});
}

function wait(ms = 1000){
  return new Promise((resolve,reject) => setTimeout(resolve,ms));
}

function launchMongo(){
  let mongoProc = spawn_command_async("mongod",["--dbpath",process.cwd(),"--logpath","/tmp/mongod.log"]);
  mongoProc.stdout.pipe(process.stdout);
  mongoProc.stderr.pipe(process.stdout);
  return mongoProc;
}


// Main

(async function(){
  console.log("Launching mongo");
  let mongoProc = launchMongo();
  
  
  await wait(30 * 1000); // testing test
  
  console.log("Killing mongo");
  mongoProc.kill("SIGINT");
})();
