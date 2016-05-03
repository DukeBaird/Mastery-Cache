
import express from 'express';
import request from 'request';
import Promise from 'bluebird';

Promise.promisifyAll(request);

let router = express.Router();

function checkSummoner(req, res, next) {
	const summonerName = req.query.summoner;
	const region = req.query.region || 'na';

	request.getAsync('https://na.api.pvp.net//api/lol/' + region + '/v1.4/summoner/by-name/' + 
		summonerName + '?api_key=' + process.env.LOLAPPKEY)
		.then((response) => {

		    const body = response.body;
            const parsedBody = JSON.parse(body);
            const summonerId = parsedBody[Object.keys(parsedBody)[0]].id;

            request.getAsync('https://na.api.pvp.net/championmastery/location/' + region + '1/player/' + 
            	summonerId + '/topchampions?count=3&api_key=' + process.env.LOLAPPKEY)
            	.then((response) => {
            		const body = response.body;
            		const parsedBody = JSON.parse(body);
            		console.log(parsedBody);

            		res.status(200).json({
						playerId: summonerId
					});
            });
		});
}
router.get('/topMastery', checkSummoner);

exports.router = router;
