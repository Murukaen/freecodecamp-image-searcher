"use strict";

const appName = "Image Searcher"
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const path = require('path')

const PER_PAGE = 10

var flickr = null
var history = []

var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: "672c2e008e4700351d359679e3892d73",
      secret: "d072e1c3fd6aa30b"
    };
 
Flickr.tokenOnly(flickrOptions, function(error, f) {
    flickr = f
    console.log("Flick initialized")
});

function addToHistory(tags) {
    history.push({
        tags: tags,
        time: new Date()
    })
}

app.get('/api/search/:tags',function(req,res){
    console.log("req.params.tags", req.params.tags)
    let page = req.query.page
    if (flickr) {
        flickr.photos.search(
            {
                tags: req.params.tags,
                tag_mode: 'all',
                per_page: PER_PAGE,
                page: page || 1
            }, 
            function(err, result) {
                if (err)
                    throw err;
                let rez = result.photos.photo.map((p) => {return {url: `https://farm${p.farm}.staticflickr.com/${p.server}/${p.id}_${p.secret}.jpg`}})
                addToHistory(req.params.tags)
                res.send(rez)
        });
    }
    else {
        res.send({});
    }
});

app.get('/api/recent', (req, res) => {
    res.send(history.slice(Math.max(0, history.length-PER_PAGE)))
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
})


app.listen(port, function () {
  console.log(`${appName} app listening on port ${port}`)
})