'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

const server = express();
const PORT = process.env.PORT || 5000;

server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');


const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );


server.get('/',homeHandler);




function homeHandler (req,res){
    let location = usa;
    let url = `https://jobs.github.com/positions.json?location=${location}`;

    superagent.get(url)
    .then(data => {
        data = data.body;
        let allData = data.map(item => {
            let newJob = new JOBS(item);
            return newJob;
        })
        res.render('views/home', { allJobs : allData });
    })
}



function JOBS (obj){
    this.title = obj.title;
    this.company = obj.company;
    this.location = obj.location;
    this.url = obj.url;
    this.description = obj.description;
}


client.connect()
.then(() => {
    server.listen(PORT,() => {
        console.log(`port = ${PORT}`);
    })
})
