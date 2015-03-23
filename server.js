var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();


app.get('/scrape', function(req, res){
    url = 'http://www.reddit.com/r/dailyprogrammer/comments/';

    var json = {account : []};
    var seen = {};
    function programmerScraper(url) {
        request(url, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                username = $('.tagline').each(function(i, el) {
                    var username = $(this).children('.author').text();
                    var flair = $(this).children('.flair').text();
                    if(flair !== '') {
                        flair = flair.split(' ');
                        var gold = flair[0];
                        var silver = flair[1];
                        var account = {
                            username: username,
                            goldAmount: gold,
                            silverAmount: silver
                        }
                        if (!seen.hasOwnProperty(username)) {
                            seen[username] = true;
                            json.account.push(account);
                        }
                        
                    }
                });
                var nextUrl = $('.nextprev a').filter(function(i, el) {
                    return $(this).attr('rel') == 'nofollow next';
                }).attr('href');
                console.log(nextUrl);
                if (nextUrl !== undefined) {
                    programmerScraper(nextUrl);
                } else {
                    res.send(json);
                }
                
            }
        });
    }
    programmerScraper(url);
});

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;