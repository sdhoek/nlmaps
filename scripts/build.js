const shell = require('shelljs');
const conf = require('./conf.json');
const helpers = require('./helpers');
const { spawn } = require('child_process')
const chokidar = require('chokidar');

const tasks = helpers.tasks();

const rollup_args = ['-c', 'config/rollup.all.js'];

//if user passed watch flag to wrapper, use rollup's watch mode
if (helpers.args.watch) {
  rollup_args.unshift('--watch')
}

tasks.forEach(task => {
  //create output directories for static assets if they don't exist yet
  const assetsdirpath = 'packages/' + helpers.packagePath(task) + '/build/assets';
  if (!shell.test('-e', assetsdirpath)) {
    shell.mkdir('-p', assetsdirpath);
  }
  if (! shell.test('-e', assetsdirpath + '/img')) {
    shell.mkdir('-p', assetsdirpath + '/img');
  }
  if (! shell.test('-e', assetsdirpath + '/css')) {
    shell.mkdir('-p', assetsdirpath + '/css');
  }
})

function main() {
  //run each package's rollup command from the package's directory
  //and capture/log output
  tasks.forEach(task => {
    console.log(rollup_args)
    const build = spawn('../../node_modules/rollup/bin/rollup', rollup_args, {cwd: 'packages/' + helpers.packagePath(task)});

    build.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    build.stderr.on('data', (data) => {
      console.log(`${data}`);
    });

    build.on('close', (code) => {
      console.log(`child process for ${task} exited with code ${code}`);
    });
  })


  //one-off copy
  tasks.forEach(task => {
    shell.cp('-ur', 'packages/assets/css/*.css', 'packages/' + helpers.packagePath(task) + '/build/assets/css/');
    shell.cp('-ur', 'packages/assets/img/*', 'packages/' + helpers.packagePath(task) + '/build/assets/img/');

  })
  //copy assets to dist
  if (helpers.args.watch) {
    chokidar.watch('packages/assets/').on('all',(event, path) => {
      let newpath = path.split('/');
      newpath.splice(0,2);
      let newpathstring = newpath.join('/');
      tasks.forEach( task => {
        if (!shell.test('-d', path)){
          shell.cp('-ur', path, 'packages/' + helpers.packagePath(task) + '/build/assets/' + newpathstring);
        }
           
      
      } )

    })
  }
}



if (typeof require !== 'undefined' && require.main === module) {
    main();
}

module.exports = main; 
