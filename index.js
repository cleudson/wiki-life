const getlivingBeing = require('./life');
const readline = require("readline");
const Confirm = require('prompt-confirm');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Type URL from Wikipedia? ", function(url) {
    wikipediaUrl = url;
    rl.close();
    const prompt = new Confirm('Save data into file?');
    prompt.ask(function(answer) {
        getlivingBeing(url, answer);
    });
});
