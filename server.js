'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const { render } = require('ejs');

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
server.get('/search' , searchHandler);
server.get('/result/:description' , resultHandler);
server.post('/addList' , addListHandler);
server.get('/myList' , myListHandler);
server.get('/details/:id' , detailsHandler);
server.delete('/delete/:id' , deleteHandler);
server.put('/update/:id' , updateHandler);





function homeHandler (req,res){
    let location = usa;
    let url = `https://jobs.github.com/positions.json?location=${location}`;

    superagent.get(url)
    .then(data => {
        data = data.body;
        let allData = data.map(item => {
            let newJob = new JOBS(item);
            return newJob;
        });
        res.render('views/home', { allJobs : allData });
    })
}

function searchHandler (req,res){
    let description = req.body.search;

    res.redirect(`/result/${description}`);

}

function resultHandler(req,res){
    let description = req.params.description;
    
    let location = 'usa';
    let url = `https://jobs.github.com/positions.json?description=${description}&location=${location}`;

    superagent.get(url)
    .then(data => {
        data = data.body;
        let allData = data.map(item => {
            let newJob = new JOBS(item);
            return newJob;
        });
        res.render('views/result', { allJobs : allData });
    })
}


function addListHandler (req,res){
    let {title,company,location,url,description} = req.body;

    let data = [title,company,location,url,description];

    let query = `INSERT INTO jobs (title,company,location,url,description) VALUES ($1,$2,$3,$4,$5);`;

    client.query(query,data)
    .then(() => {
        res.redirect('myList');
    })
}


function myListHandler (req,res){
    let query = `SELECT * FROM jobs;`;

    client.query(query)
    .then(data => {
        res.render('views/myList',{allJobs:data.rows});
    })
}

function detailsHandler (req,res){
    let id = req.params.id;
    let arr = [id];
    let query = `SELECT * FROM jobs WHERE id = $1;`;
    client.query(query,arr)
    .then(data => {
        res.render('views/details' , {allJobs:data.rows});
    })
}

function deleteHandler (req,res){
    let id = [req.params.id];
    let query = `DELETE FROM jobs WHERE id = $1;`;

    client.query(query,id)
    .then(() => {
        res.redirect('/');
    })
}


function updateHandler (req,res){
    let id = req.params.id;
    let data = Object.values(req.body);

    let query = `UPDATE jobs SET title = $1, company = $2, location = $3, url = $4, description = $5 WHERE id = ${id};`;

    client.query(query,data)
    .then(() => {
        res.redirect(`/details/${id}`);
    });
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
