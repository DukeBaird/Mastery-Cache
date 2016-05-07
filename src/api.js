
import express from 'express';
import request from 'request';
import Promise from 'bluebird';

Promise.promisifyAll(request);

let router = express.Router();

function checkSummoner(req, res, next) {
	const summonerName = req.query.summoner;
	const region = req.query.region;

	request.getAsync('https://' + region + '.api.pvp.net//api/lol/' + region + '/v1.4/summoner/by-name/' + 
		summonerName + '?api_key=' + process.env.LOLAPPKEY)
		.then((response) => {

		    const body = response.body;
            const parsedBody = JSON.parse(body);
            if (parsedBody.status && parsedBody.status.status_code === 404) {
            	res.status(404).json({
            		err: 404
            	});
            	return;
            }
            const summonerId = parsedBody[Object.keys(parsedBody)[0]].id;

            request.getAsync('https://' + region + '.api.pvp.net/championmastery/location/' + region + '1/player/' + 
            	summonerId + '/topchampions?count=3&api_key=' + process.env.LOLAPPKEY)
            	.then((response) => {
            		const parsedBody = JSON.parse(response.body);
            		const champs  = [
            			{
            				id: 0,
            				mastery: 0
            			},
            			{
            				id: 0,
            				mastery: 0
            			},
            			{  
	          				id: 0,
            				mastery: 0
						}
            		];

            		Promise.all(parsedBody.map((champion, index) => {
            			champs[index].id = champion.championId;
            			champs[index].mastery = champion.championLevel;
            			return request.getAsync('https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion/' + champion.championId +
            				'?api_key=' + process.env.LOLAPPKEY);
            		})).then(function(data) {
            			if (data.length !== 3) {
            				res.status(200).json({
            					playerId: summonerId,
            					champions: []
            				});
            				return;
            			}

            			const champ1 = JSON.parse(data[0].body);
            			const champ2 = JSON.parse(data[1].body);
            			const champ3 = JSON.parse(data[2].body);

            			champs.map((champ) => {
            				if (champ.id === champ1.id) {
            					champ1.mastery = champ.mastery;
            				} else if (champ.id === champ2.id) {
            					champ2.mastery = champ.mastery;
            				} else if (champ.id === champ3.id) {
            					champ3.mastery = champ.mastery;
            				}
            			});

            			champs[0] = champ1;
            			champs[1] = champ2;
            			champs[2] = champ3;

	            		res.status(200).json({
							playerId: summonerId,
							champions: champs
						});
            		});


            });
		});
}
router.get('/topMastery', checkSummoner);

exports.router = router;
