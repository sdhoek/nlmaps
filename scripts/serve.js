const conf = require('./conf.json');
const liveserver = require('live-server');
const helpers = require('./helpers');

const tasks = helpers.tasks(true);

function main() {
  const servers = tasks.map(task => {
    //check if this task should have a server started.
    if (helpers.isServableTask(task)) {
      let serverconf = require('./liveserver/liveserver-' + task + '.json');
      serverconf.root = 'packages/' + helpers.packagePath(task) + '/' + serverconf.root;
      return liveserver.start(serverconf)
    }
  })

  process.on('SIGINT', () => {
    console.log('stopping servers ...');
    servers.forEach(server => server.close());
    process.exit();
  })
}


if (typeof require !== 'undefined' && require.main === module) {
    main();
}

module.exports = main; 
