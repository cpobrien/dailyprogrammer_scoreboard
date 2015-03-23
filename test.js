var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
    url = 'http://www.reddit.com/r/dailyprogrammer/';
    var json = {account : []};
    var seen = {};

    /** This feels like it's probably not the best practice,
    but in order to do something syncronously I'm just gonna
    make some counter**/
    var counter = 0;
    function digComments(url, length, nextUrl) {
        request(url, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                counter++;
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
                if (counter > length) {
                    counter = 0;
                    /** "Temporary" workaround **/
                    if (nextUrl.indexOf('625') == -1) { 
                        programmerScraper(nextUrl);
                    } else {
                        res.send(json);
                    }
                }

            }
        });
    }

    function programmerScraper(url) {
        request(url, function(error, response, html){
            if(!error){
                console.log(url);
                var $ = cheerio.load(html);
                var nextUrl = $('.nextprev a').filter(function(i, el) {
                    return $(this).attr('rel') == 'nofollow next';
                }).attr('href');
                var comments = $('.comments').each(function(i, el) {
                    var href = $(this).attr('href');
                    digComments(href, $('.comments').length - 1, nextUrl);
                });            
                
                
            }
        });
    }
    programmerScraper(url);

});


app.listen('8081')
console.log('Magic happens on port 8081');

exports = module.exports = app;

