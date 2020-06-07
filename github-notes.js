const chokidar = require('chokidar');
const tilde = require('tilde-expansion');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const wikiPath = process.env.WIKI_PATH;
const notesPath = process.env.NOTES_PATH;
const simpleGit = require('simple-git')(notesPath);

function copy(file, folder, callback) {
  console.log('cp "' + file + '" ' + folder);
  require('child_process').exec('cp "' + file + '" ' + folder, (err, stdout) => {
    console.log(err, stdout);
    callback(folder + path.basename(file))
  });
}

function commit(file) {
  console.log('commit ' + file);
  simpleGit
    .add(file)
    .commit('Autocommit from wiki', [file])
    .push('origin', 'master');
}

function commitFile(file) {
  copy(file, notesPath + '/', (file) => commit(file));
}

tilde(wikiPath, dir => {
  console.log('watching dir ' + dir);
  chokidar
    .watch(dir, { ignoreInitial: false })
    .on('change', file => commitFile(file))
});
