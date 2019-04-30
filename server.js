/*
    reddstack-ws provides a interface into the reddstack environment
    Copyright (C) 2019  gnasher@reddcoin.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const express = require('express');
const ws = require('./wsserver');
const config = require('./config');

const {app: {port}} = config;

let app = express();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/www/ws.html');
});
app.get('/docs', function (req, res) {
    res.sendFile(__dirname + '/www/docs/index.html');
});

app.listen(`${port}`, function () {
  console.log(`Server app listening on port ${port}!`)
});
