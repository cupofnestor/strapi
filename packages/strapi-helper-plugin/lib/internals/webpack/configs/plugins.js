/**
 * Shortcut to get list of Strapi's plugins.
 */

const fs = require('fs');
const path = require('path');
const { __IS_ADMIN__, __NPM_START_EVENT__ } = require('./globals');
const paths = require('./paths');


// Create plugins object.
const plugins = {
  exist: false,
  src: [],
  folders: {},
};

if (__NPM_START_EVENT__) {
  try {
    fs.accessSync(path.resolve(paths.appPath, 'plugins'), fs.constants.R_OK);
  } catch (e) {
    // Allow app without plugins.
    plugins.exist = true;
  }
  
  if (__IS_ADMIN__ && !plugins.exist) {
    const pluginsDirectory = path.resolve(paths.appPath, 'plugins');

    plugins.src = fs
      .readdirSync(pluginsDirectory)
      .filter(x => {
        // Read `plugins` directory and check if the plugin comes with an UI (it has an App container).
        // If we don't do this check webpack expects the plugin to have a containers/App/reducer.js to create
        // the plugin's store (redux).
        let hasAdminFolder;
        
        try {
          const pluginMainContainer = path.join(pluginsDirectory, x, 'admin', 'src', 'containers', 'App');
          fs.accessSync(pluginMainContainer);

          hasAdminFolder = true;
        } catch(err) {
          hasAdminFolder = false;
        }
        
        return x[0] !== '.' && hasAdminFolder;
      });
  } else {
    plugins.src = [];
  }

  // Construct object of plugin' paths.
  plugins.folders = plugins.src.reduce((acc, current) => {
    acc[current] = path.resolve(
      paths.appPath,
      'plugins',
      current,
      'node_modules',
      'strapi-helper-plugin',
      'lib',
      'src',
    );
    
    return acc;
  }, {});
}

module.exports =  plugins;