#!/usr/bin/env node

const program = require('commander');

program
    .command('merge', 'merge pull request and delete branch')
    .parse(process.argv);
