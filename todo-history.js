const chokidar = require('chokidar');
const tilde = require('tilde-expansion');
const fs = require('fs');
require('dotenv').config();
var dateFormat = require('dateformat');

const wikiPath = process.env.WIKI_PATH;
const historySuffix = '-History.txt';

function findTodos(content) {
    return content.match(/^.*-\ \[x\](.*\s*)$/mg, '') || [];
}

function removeTodos(todos, content) {
    const replace = (content, todo) => content.replace(todo + '\n', '');

    return todos.reduce(replace, content) || content;
}

function todoHistory(todos, today) {
    return "## " + dateFormat(today, 'yyyy-mm-dd') + '\n'
        +  todos.join('\n');
}

function readFile(file, callback) {
    fs.readFile(file, 'utf8', (err, content) => {
        if (err) {
            console.log(err);
            return callback('');
        }
        callback(content);
    });
}

function writeFile(file, content) {
    fs.writeFile(file, content, function(err) {
        if (err) throw err;
    });
}

function moveCheckedTodosToHistory(file) {
    readFile(file, (content) => {
        const todos = findTodos(content);
        console.log(todos);
        if (!todos || todos.length === 0) return;
        writeFile(file, removeTodos(todos, content));

        const historyFile = file.replace('.txt', historySuffix);
        readFile(historyFile, (history) => {
            writeFile(historyFile, todoHistory(todos, new Date()) + "\n\n" + history)
        });
    });
}

tilde(wikiPath + 'ToDo.txt', file => moveCheckedTodosToHistory(file));
tilde(wikiPath + 'Terberg Midoffice.txt', file => moveCheckedTodosToHistory(file));

// Watcher version
//tilde(wikiPath, dir =>
//  chokidar
//    .watch(dir, { ignored: `/.*${historySuffix}$/`, ignoreInitial: true })
//    .on('change', file => moveCheckedTodosToHistory(file)));
